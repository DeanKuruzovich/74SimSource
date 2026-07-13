// ── 74Sim Onramp Lesson Boards ───────────────────────────────────────────────
// Board-state constants for the onramp lessons (imported by onramp-lessons.js).
//
// Most boards are copies of shipped example circuits (js/examples/*.json).
// The lesson player loads boards synchronously from inline JS, so the JSON is
// duplicated here rather than fetched from /api/examples at runtime. If an
// example is improved, re-copy it here (they are verified together by
// js/debug/scenarios/onramp-lesson-boards.mjs).
//
// Four boards are authored here and exist only here: MEM_INTRO / ROM_DEMO /
// RAM_DEMO for the memory lessons and GLITCH_HAZARD_BOARD for the glitches &
// hazards lesson. ROM contents are preloaded through the chip's
// serialized ffState: the 28C16 evaluator keys its storage as 'IO0_eeprom2k'
// with mem[addr] = [bit0..bit7] (LSB first); the 74x219 uses 'Q1_r16x4ni'.


// ── Lesson 4: CD4001 NOR SR latch (from CD4001-SR-Latch.json) ────────────────
// RESET button → pin 1 (gate 1 in), SET button → pin 5 (gate 2 in), both with
// 10k pull-downs. Green LED = Q, red LED = Q-bar.

export const CD4001_SR_LATCH_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 20, row: 4, chipId: 'CD4001' },
    { id: 3, type: 'push_button', startHoleId: '0:0:power:20:3', endHoleId: '0:0:main:20:7' },
    { id: 4, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:20:8', endHoleId: '0:0:power:20:2' },
    { id: 5, type: 'push_button', startHoleId: '0:0:power:24:3', endHoleId: '0:0:main:24:7' },
    { id: 6, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:24:8', endHoleId: '0:0:power:24:2' },
    { id: 7, type: 'resistor', resistance: 470, startHoleId: '0:0:main:22:8', endHoleId: '0:0:main:30:6' },
    { id: 8, type: 'led', color: 'green', startHoleId: '0:0:main:30:7', endHoleId: '0:0:power:30:2' },
    { id: 9, type: 'resistor', resistance: 470, startHoleId: '0:0:main:23:8', endHoleId: '0:0:main:34:6' },
    { id: 10, type: 'led', color: 'red', startHoleId: '0:0:main:34:7', endHoleId: '0:0:power:34:2' },
    { id: 11, type: 'capacitor', capacitance: 0.000001, startHoleId: '0:0:main:20:9', endHoleId: '0:0:power:20:3' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:20:3', endHoleId: '0:0:power:20:1', color: '#ff6b6b' },
    { id: 2, startHoleId: '0:0:main:26:6', endHoleId: '0:0:power:26:2', color: '#2244bb' },
    { id: 3, startHoleId: '0:0:main:22:7', endHoleId: '0:0:main:25:7', color: '#00b894' },
    { id: 4, startHoleId: '0:0:main:23:7', endHoleId: '0:0:main:21:7', color: '#fdcb6e' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 180, y: -150, w: 520, h: 44, text: 'Title: CD4001 NOR SR Latch', v: 2 },
    { id: 2, x: 180, y: -100, w: 640, h: 60, text: 'Description: Two cross-coupled NOR gates of a CD4001 make a Set-Reset latch that remembers one bit. Press SET, the green Q LED latches ON; press RESET, it latches OFF.', v: 2 },
    { id: 3, x: 180, y: 250, w: 700, h: 110, text: 'Details: Gate 1 (pins 1,2 -> 3) and gate 2 (pins 4,5,6) are cross-wired: Q1->B2 and Q2->B1. The RESET button drives pin 1, the SET button drives pin 5; each input has a 10k pull-down so a released button reads a clean LOW (CMOS inputs must never float). SET=HIGH forces Q (green) HIGH; RESET=HIGH forces Q LOW; both released = HOLD. The red LED shows Q-bar, always the opposite of Q.', v: 2 },
  ],
};


// ── Lesson 4: CD4013 coin toss (from CD4013-CoinToss.json) ───────────────────
// D flip-flop with Q-bar fed back to D → divide-by-2 toggle. Holding TOSS
// gates a 240 Hz clock into CLK; release lands on a random side.

export const CD4013_COINTOSS_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 20, row: 4, chipId: 'CD4013' },
    { id: 2, type: 'clock', tileX: 0, tileY: 0, col: 16, row: 8, frequencyHz: 240, dutyCycle: 0.5 },
    { id: 3, type: 'push_button', startHoleId: '0:0:main:16:7', endHoleId: '0:0:main:22:6' },
    { id: 4, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:22:7', endHoleId: '0:0:power:22:2' },
    { id: 5, type: 'resistor', resistance: 470, startHoleId: '0:0:main:20:6', endHoleId: '0:0:main:30:6' },
    { id: 6, type: 'led', color: 'green', startHoleId: '0:0:main:30:7', endHoleId: '0:0:power:30:2' },
    { id: 7, type: 'resistor', resistance: 470, startHoleId: '0:0:main:21:7', endHoleId: '0:0:main:34:6' },
    { id: 8, type: 'led', color: 'red', startHoleId: '0:0:main:34:7', endHoleId: '0:0:power:34:2' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:20:3', endHoleId: '0:0:power:20:1', color: '#ff6b6b' },
    { id: 2, startHoleId: '0:0:main:26:6', endHoleId: '0:0:power:26:2', color: '#2244bb' },
    { id: 3, startHoleId: '0:0:main:24:6', endHoleId: '0:0:main:21:6', color: '#fdcb6e' },
    { id: 4, startHoleId: '0:0:main:25:6', endHoleId: '0:0:main:26:7', color: '#2244bb' },
    { id: 5, startHoleId: '0:0:main:23:6', endHoleId: '0:0:main:26:8', color: '#2244bb' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 180, y: -150, w: 520, h: 44, text: 'Title: CD4013 Electronic Coin Toss', v: 2 },
    { id: 2, x: 180, y: -100, w: 680, h: 60, text: 'Description: One half of a CD4013 flip-flop wired to toggle. Hold the TOSS button to spin it fast (both LEDs blur), release to land on HEADS (green) or TAILS (red) at random.', v: 2 },
    { id: 3, x: 180, y: 250, w: 740, h: 130, text: 'Details: Q-bar (pin 2) feeds back to D (pin 5), so every rising clock edge flips the flip-flop -- a divide-by-2 toggle. A 240 Hz clock reaches the CLK input (pin 3) only while the TOSS button is held, so the flip-flop races far faster than the eye can follow. Release and it freezes on whichever side it was on -- genuinely unpredictable. The 10k from CLK to GND is a pull-down: with the button open it holds CLK at a clean LOW (no stray edges). SET (pin 6) and RST (pin 4) are active-HIGH on a CD4013, so both are tied to GND to keep them switched off. Q (pin 1) lights HEADS, Q-bar (pin 2) lights TAILS -- always opposite. Click the clock to change the spin speed.', v: 2 },
  ],
};


// ── Lesson 5: Schmitt-trigger RC oscillator (from SchmittTriggerClock.json) ──
// A 74x14 inverter with an RC feedback network self-oscillates; a second
// 74x14 buffers the output to the LED.

export const SCHMITT_CLOCK_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 6, row: 4, chipId: '7414' },
    { id: 3, type: 'capacitor', capacitance: 0.000009999999999999999, startHoleId: '0:0:main:8:0', endHoleId: '0:0:power:8:0' },
    { id: 6, type: 'chip', tileX: 0, tileY: 0, col: 6, row: 4, chipId: '74x14' },
    { id: 19, type: 'resistor', resistance: 10, startHoleId: '0:0:main:8:3', endHoleId: '0:0:main:7:3' },
    { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 14, row: 4, chipId: '74x14' },
    { id: 22, type: 'led', color: 'red', startHoleId: '0:0:main:23:2', endHoleId: '0:0:power:23:0' },
  ],
  wires: [
    { id: 50, startHoleId: '0:0:main:6:3', endHoleId: '0:0:power:6:1', color: '#00cec9' },
    { id: 51, startHoleId: '0:0:main:12:6', endHoleId: '0:0:power:12:2', color: '#3498db' },
    { id: 61, startHoleId: '0:0:main:8:2', endHoleId: '0:0:main:15:3', color: '#e84393' },
    { id: 62, startHoleId: '0:0:main:14:3', endHoleId: '0:0:power:14:1', color: '#f39c12' },
    { id: 63, startHoleId: '0:0:main:20:6', endHoleId: '0:0:power:20:2', color: '#3498db' },
    { id: 64, startHoleId: '0:0:main:16:3', endHoleId: '0:0:main:23:3', color: '#ff7675' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  pureDigital: false,
  textBoxes: [
    { id: 1, x: -194, y: -77, w: 297, h: 98, text: 'Title: Schmitt Trigger Inverter RC Oscillator', v: 2 },
    { id: 2, x: -194, y: 36, w: 267, h: 88, text: 'Description: The inverter output charges and discharges the capacitor through the resistor; the two Schmitt thresholds turn that ramp into a clean square wave on the LED.', v: 2 },
  ],
};


// ── Lesson 6: dual 555 timers (from 2x555timers.json) ────────────────────────
// LEFT 555 = monostable (press the button for a one-shot pulse on the red
// LED). RIGHT 555 = astable (green LED blinks ~1 Hz).

export const DUAL_555_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 10, row: 4, chipId: '555', ffState: { OUT: { q: 0 } } },
    { id: 2, type: 'resistor', resistance: 10000, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:11:2' },
    { id: 3, type: 'capacitor', capacitance: 0.000009999999999999999, startHoleId: '0:0:main:11:1', endHoleId: '0:0:power:11:0' },
    { id: 4, type: 'resistor', resistance: 10000, startHoleId: '0:0:power:16:3', endHoleId: '0:0:main:11:6' },
    { id: 5, type: 'push_button', startHoleId: '0:0:main:11:9', endHoleId: '0:0:power:11:2' },
    { id: 6, type: 'resistor', resistance: 470, startHoleId: '0:0:main:12:6', endHoleId: '0:0:main:17:6' },
    { id: 7, type: 'led', color: 'red', startHoleId: '0:0:main:17:6', endHoleId: '0:0:power:17:2' },
    { id: 13, type: 'led', color: 'green', startHoleId: '0:0:main:36:7', endHoleId: '0:0:power:36:2' },
    { id: 12, type: 'resistor', resistance: 470, startHoleId: '0:0:main:31:6', endHoleId: '0:0:main:36:6' },
    { id: 8, type: 'chip', tileX: 0, tileY: 0, col: 29, row: 4, chipId: '555', ffState: { OUT: { q: 1 } } },
    { id: 9, type: 'resistor', resistance: 10000, startHoleId: '0:0:power:24:1', endHoleId: '0:0:main:30:1' },
    { id: 11, type: 'capacitor', capacitance: 1e-7, startHoleId: '0:0:main:30:8', endHoleId: '0:0:power:30:2' },
    { id: 10, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:30:3', endHoleId: '0:0:main:30:6' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:3', color: '#ff6b6b' },
    { id: 2, startHoleId: '0:0:power:10:2', endHoleId: '0:0:main:10:6', color: '#4ecdc4' },
    { id: 3, startHoleId: '0:0:power:12:3', endHoleId: '0:0:main:13:6', color: '#ff6b6b' },
    { id: 4, startHoleId: '0:0:main:11:3', endHoleId: '0:0:main:12:3', color: '#ffd93d' },
    { id: 5, startHoleId: '0:0:power:29:1', endHoleId: '0:0:main:29:3', color: '#ff6b6b' },
    { id: 6, startHoleId: '0:0:power:29:2', endHoleId: '0:0:main:29:6', color: '#4ecdc4' },
    { id: 7, startHoleId: '0:0:main:31:3', endHoleId: '0:0:main:30:7', color: '#ffd93d' },
    { id: 8, startHoleId: '0:0:main:32:8', endHoleId: '0:0:power:33:3', color: '#fdcb6e' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 10, y: -180, w: 400, h: 50, text: 'Title: Dual 555 Timers', v: 2 },
    { id: 2, x: 10, y: -120, w: 634, h: 50, text: 'Description: Two 555 timers   one monostable, one astable.', v: 2 },
    { id: 3, x: 10, y: -60, w: 634, h: 90, text: 'Details: LEFT   press the button to trigger a one shot pulse (monostable). RIGHT   LED blinks automatically at ~1 Hz (astable). Both use external RC networks for timing.', v: 2 },
  ],
};


// ── Lesson 7: 8-3-8 encoder/decoder (from 8-3-8.json) ────────────────────────
// Eight active-low switches → 74x148 priority encoder → 3-bit code (red LEDs)
// → 74x237 decoder → 1-of-8 yellow LEDs.

export const ENCODE_DECODE_838_BOARD = {
  version: 1,
  components: [
    { id: 7, type: 'switch', on: false, startHoleId: '0:0:power:6:2', endHoleId: '0:0:main:6:7' },
    { id: 8, type: 'switch', on: false, startHoleId: '0:0:power:8:2', endHoleId: '0:0:main:8:7' },
    { id: 9, type: 'switch', on: false, startHoleId: '0:0:power:9:2', endHoleId: '0:0:main:9:7' },
    { id: 113, type: 'switch', on: false, startHoleId: '0:0:power:4:2', endHoleId: '0:0:main:4:7' },
    { id: 6, type: 'switch', on: false, startHoleId: '0:0:power:5:2', endHoleId: '0:0:main:5:7' },
    { id: 120, type: 'switch', on: false, startHoleId: '0:0:power:3:2', endHoleId: '0:0:main:3:7' },
    { id: 122, type: 'switch', on: false, startHoleId: '0:0:power:10:2', endHoleId: '0:0:main:10:7' },
    { id: 123, type: 'switch', on: false, startHoleId: '0:0:power:11:2', endHoleId: '0:0:main:11:7' },
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 13, row: 4, chipId: '74x148' },
    { id: 126, type: 'led', color: 'red', startHoleId: '0:0:main:22:0', endHoleId: '0:0:power:22:0' },
    { id: 127, type: 'led', color: 'red', startHoleId: '0:0:main:23:0', endHoleId: '0:0:power:23:0' },
    { id: 128, type: 'led', color: 'red', startHoleId: '0:0:main:24:0', endHoleId: '0:0:power:24:0' },
    { id: 130, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:11:5', endHoleId: '0:0:power:11:1' },
    { id: 131, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:10:5', endHoleId: '0:0:power:10:1' },
    { id: 132, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:9:5', endHoleId: '0:0:power:9:1' },
    { id: 133, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:8:5', endHoleId: '0:0:power:8:1' },
    { id: 134, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:6:5', endHoleId: '0:0:power:6:1' },
    { id: 135, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:5:5', endHoleId: '0:0:power:5:1' },
    { id: 136, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:4:5', endHoleId: '0:0:power:4:1' },
    { id: 137, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:3:1', endHoleId: '0:0:main:3:5' },
    { id: 141, type: 'chip', tileX: 0, tileY: 0, col: 27, row: 4, chipId: '74x237', ffState: { Y0_dl8hi: { addr: 7 } } },
    { id: 146, type: 'led', color: 'yellow', startHoleId: '0:0:main:38:0', endHoleId: '0:0:power:38:0' },
    { id: 147, type: 'led', color: 'yellow', startHoleId: '0:0:main:39:0', endHoleId: '0:0:power:39:0' },
    { id: 152, type: 'led', color: 'yellow', startHoleId: '0:0:main:40:0', endHoleId: '0:0:power:40:0' },
    { id: 153, type: 'led', color: 'yellow', startHoleId: '0:0:main:41:0', endHoleId: '0:0:power:41:0' },
    { id: 154, type: 'led', color: 'yellow', startHoleId: '0:0:main:44:0', endHoleId: '0:0:power:44:0' },
    { id: 155, type: 'led', color: 'yellow', startHoleId: '0:0:main:45:0', endHoleId: '0:0:power:45:0' },
    { id: 156, type: 'led', color: 'yellow', startHoleId: '0:0:main:46:0', endHoleId: '0:0:power:46:0' },
    { id: 157, type: 'led', color: 'yellow', startHoleId: '0:0:main:47:0', endHoleId: '0:0:power:47:0' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:12:1', endHoleId: '0:0:main:13:3', color: '#ff6b6b' },
    { id: 2, startHoleId: '0:0:power:20:2', endHoleId: '0:0:main:20:6', color: '#4ecdc4' },
    { id: 13, startHoleId: '0:0:main:20:3', endHoleId: '0:0:main:24:3', color: '#74b9ff' },
    { id: 14, startHoleId: '0:0:main:19:6', endHoleId: '0:0:main:23:3', color: '#55efc4' },
    { id: 15, startHoleId: '0:0:main:18:6', endHoleId: '0:0:main:22:3', color: '#1abc9c' },
    { id: 16, startHoleId: '0:0:main:14:3', endHoleId: '0:0:power:14:0', color: '#ffeaa7' },
    { id: 18, startHoleId: '0:0:main:17:6', endHoleId: '0:0:power:17:2', color: '#6c5ce7' },
    { id: 19, startHoleId: '0:0:main:3:6', endHoleId: '0:0:main:19:3', color: '#ffeaa7' },
    { id: 20, startHoleId: '0:0:main:4:6', endHoleId: '0:0:main:18:3', color: '#ff7675' },
    { id: 21, startHoleId: '0:0:main:5:6', endHoleId: '0:0:main:17:3', color: '#3498db' },
    { id: 22, startHoleId: '0:0:main:6:6', endHoleId: '0:0:main:16:3', color: '#74b9ff' },
    { id: 23, startHoleId: '0:0:main:8:6', endHoleId: '0:0:main:13:6', color: '#6c5ce7' },
    { id: 24, startHoleId: '0:0:main:9:6', endHoleId: '0:0:main:14:6', color: '#74b9ff' },
    { id: 25, startHoleId: '0:0:main:10:6', endHoleId: '0:0:main:15:6', color: '#f39c12' },
    { id: 26, startHoleId: '0:0:main:11:6', endHoleId: '0:0:main:16:6', color: '#f39c12' },
    { id: 27, startHoleId: '0:0:main:24:2', endHoleId: '0:0:main:27:6', color: '#74b9ff' },
    { id: 28, startHoleId: '0:0:main:23:2', endHoleId: '0:0:main:28:6', color: '#55efc4' },
    { id: 29, startHoleId: '0:0:main:22:2', endHoleId: '0:0:main:29:6', color: '#1abc9c' },
    { id: 30, startHoleId: '0:0:main:27:3', endHoleId: '0:0:power:27:1', color: '#fdcb6e' },
    { id: 31, startHoleId: '0:0:main:34:6', endHoleId: '0:0:power:34:2', color: '#f39c12' },
    { id: 32, startHoleId: '0:0:main:30:6', endHoleId: '0:0:power:30:3', color: '#74b9ff' },
    { id: 33, startHoleId: '0:0:main:31:6', endHoleId: '0:0:power:32:2', color: '#9b59b6' },
    { id: 34, startHoleId: '0:0:main:32:6', endHoleId: '0:0:power:32:3', color: '#2ecc71' },
    { id: 35, startHoleId: '0:0:main:28:3', endHoleId: '0:0:main:38:1', color: '#74b9ff' },
    { id: 36, startHoleId: '0:0:main:29:3', endHoleId: '0:0:main:39:1', color: '#3498db' },
    { id: 37, startHoleId: '0:0:main:30:3', endHoleId: '0:0:main:40:1', color: '#74b9ff' },
    { id: 38, startHoleId: '0:0:main:31:3', endHoleId: '0:0:main:41:1', color: '#9b59b6' },
    { id: 39, startHoleId: '0:0:main:32:3', endHoleId: '0:0:main:44:1', color: '#00cec9' },
    { id: 40, startHoleId: '0:0:main:33:3', endHoleId: '0:0:main:45:1', color: '#2ecc71' },
    { id: 41, startHoleId: '0:0:main:34:3', endHoleId: '0:0:main:46:1', color: '#ff7675' },
    { id: 42, startHoleId: '0:0:main:33:6', endHoleId: '0:0:main:47:1', color: '#74b9ff' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 10, y: -120, w: 400, h: 50, text: 'Title: 8-3-8 Encoder / Decoder', v: 2 },
    { id: 2, x: 10, y: -60, w: 600, h: 70, text: 'Description: Eight switches get converted to 3 data wires, get output back to 1 of 8 yellow LEDs.', v: 2 },
    { id: 3, x: -180, y: 153, w: 229, h: 184, text: 'Inputs to the 74x148 chip are active low, meaning to select a input to be active it needs to be low(connected to GND). The pull up resistors bring the inputs back up to high.', v: 2 },
  ],
};


// ── Lesson 8: PISO → SIPO serial link (from PISO-SIPO.json) ──────────────────
// Two boards: 74x165 parallel-in/serial-out on the left, 74x164 serial-in/
// parallel-out on the right. Only serial data, clock and the shared rails
// cross between them.

export const PISO_SIPO_BOARD = {
  version: 1,
  components: [
    { id: 2, type: 'switch', on: false, startHoleId: '0:0:power:2:3', endHoleId: '0:0:main:2:9' },
    { id: 3, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:2:5', endHoleId: '0:0:power:2:0' },
    { id: 4, type: 'switch', on: false, startHoleId: '0:0:power:5:3', endHoleId: '0:0:main:5:9' },
    { id: 5, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:5:5', endHoleId: '0:0:power:5:0' },
    { id: 6, type: 'switch', on: false, startHoleId: '0:0:power:8:3', endHoleId: '0:0:main:8:9' },
    { id: 7, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:8:5', endHoleId: '0:0:power:8:0' },
    { id: 8, type: 'switch', on: false, startHoleId: '0:0:power:11:3', endHoleId: '0:0:main:11:9' },
    { id: 9, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:11:5', endHoleId: '0:0:power:11:0' },
    { id: 10, type: 'switch', on: false, startHoleId: '0:0:power:14:3', endHoleId: '0:0:main:14:9' },
    { id: 11, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:14:5', endHoleId: '0:0:power:14:0' },
    { id: 12, type: 'switch', on: true, startHoleId: '0:0:power:17:3', endHoleId: '0:0:main:17:9' },
    { id: 13, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:17:5', endHoleId: '0:0:power:17:0' },
    { id: 14, type: 'switch', on: true, startHoleId: '0:0:power:20:3', endHoleId: '0:0:main:20:9' },
    { id: 15, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:20:5', endHoleId: '0:0:power:20:0' },
    { id: 16, type: 'switch', on: true, startHoleId: '0:0:power:23:3', endHoleId: '0:0:main:23:9' },
    { id: 17, type: 'resistor', resistance: 2000, startHoleId: '0:0:main:23:5', endHoleId: '0:0:power:23:0' },
    { id: 21, type: 'chip', tileX: 1, tileY: 0, col: 10, row: 4, chipId: '74x164',
      ffState: { QA: { stages: [0, 0, 0, 0, 0, 0, 0, 0], prevClk: 0 } } },
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 30, row: 4, chipId: '74x165',
      ffState: { QH: { stages: [0, 0, 0, 0, 0, 1, 1, 1], prevClk: 0 } }, chipFamily: 'LS' },
    { id: 41, type: 'led', color: 'green', startHoleId: '1:0:main:21:5', endHoleId: '1:0:main:21:4' },
    { id: 42, type: 'led', color: 'green', startHoleId: '1:0:main:23:5', endHoleId: '1:0:main:23:4' },
    { id: 43, type: 'led', color: 'green', startHoleId: '1:0:main:25:5', endHoleId: '1:0:main:25:4' },
    { id: 44, type: 'led', color: 'green', startHoleId: '1:0:main:27:5', endHoleId: '1:0:main:27:4' },
    { id: 46, type: 'led', color: 'green', startHoleId: '1:0:main:19:5', endHoleId: '1:0:main:19:4' },
    { id: 47, type: 'led', color: 'green', startHoleId: '1:0:main:29:5', endHoleId: '1:0:main:29:4' },
    { id: 48, type: 'led', color: 'green', startHoleId: '1:0:main:31:5', endHoleId: '1:0:main:31:4' },
    { id: 50, type: 'led', color: 'green', startHoleId: '1:0:main:33:5', endHoleId: '1:0:main:33:4' },
    { id: 52, type: 'resistor', resistance: 330, startHoleId: '1:0:main:19:0', endHoleId: '1:0:power:20:0' },
    { id: 53, type: 'resistor', resistance: 330, startHoleId: '1:0:main:21:0', endHoleId: '1:0:power:21:0' },
    { id: 55, type: 'resistor', resistance: 330, startHoleId: '1:0:main:23:0', endHoleId: '1:0:power:23:0' },
    { id: 56, type: 'resistor', resistance: 330, startHoleId: '1:0:main:25:0', endHoleId: '1:0:power:26:0' },
    { id: 59, type: 'resistor', resistance: 330, startHoleId: '1:0:main:27:0', endHoleId: '1:0:power:27:0' },
    { id: 60, type: 'resistor', resistance: 330, startHoleId: '1:0:main:29:0', endHoleId: '1:0:power:29:0' },
    { id: 61, type: 'resistor', resistance: 330, startHoleId: '1:0:main:31:0', endHoleId: '1:0:power:32:0' },
    { id: 63, type: 'resistor', resistance: 330, startHoleId: '1:0:main:33:0', endHoleId: '1:0:power:33:0' },
    { id: 79, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:31:8', endHoleId: '0:0:power:33:2' },
    { id: 80, type: 'push_button', startHoleId: '0:1:power:27:0', endHoleId: '0:1:main:27:1' },
    { id: 81, type: 'resistor', resistance: 1000, startHoleId: '0:1:main:27:2', endHoleId: '0:1:power:30:1' },
    { id: 83, type: 'push_button', startHoleId: '0:0:main:31:9', endHoleId: '0:0:power:30:3' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:30:1', endHoleId: '0:0:main:30:3', color: '#ff6b6b' },
    { id: 4, startHoleId: '0:0:power:36:0', endHoleId: '0:0:main:36:3', color: '#4ecdc4' },
    { id: 5, startHoleId: '0:0:main:2:7', endHoleId: '0:0:main:35:3', color: '#a29bfe' },
    { id: 6, startHoleId: '0:0:main:5:7', endHoleId: '0:0:main:34:3', color: '#a29bfe' },
    { id: 7, startHoleId: '0:0:main:8:7', endHoleId: '0:0:main:33:3', color: '#a29bfe' },
    { id: 8, startHoleId: '0:0:main:11:7', endHoleId: '0:0:main:32:3', color: '#a29bfe' },
    { id: 9, startHoleId: '0:0:main:14:7', endHoleId: '0:0:main:32:6', color: '#74b9ff' },
    { id: 10, startHoleId: '0:0:main:17:7', endHoleId: '0:0:main:33:6', color: '#74b9ff' },
    { id: 11, startHoleId: '0:0:main:20:7', endHoleId: '0:0:main:34:6', color: '#74b9ff' },
    { id: 12, startHoleId: '0:0:main:23:7', endHoleId: '0:0:main:35:6', color: '#74b9ff' },
    { id: 15, startHoleId: '1:0:power:10:1', endHoleId: '1:0:main:10:3', color: '#ff6b6b' },
    { id: 16, startHoleId: '1:0:power:16:2', endHoleId: '1:0:main:16:6', color: '#4ecdc4' },
    { id: 19, startHoleId: '0:0:main:37:3', endHoleId: '1:0:main:10:6', color: '#ffd93d' },
    { id: 20, startHoleId: '0:0:main:31:6', endHoleId: '1:0:main:16:3', color: '#fd79a8' },
    { id: 21, startHoleId: '1:0:main:10:7', endHoleId: '1:0:main:11:6', color: '#ffd93d' },
    { id: 26, startHoleId: '1:0:main:12:6', endHoleId: '1:0:main:19:6', color: '#3498db' },
    { id: 27, startHoleId: '1:0:main:13:6', endHoleId: '1:0:main:21:6', color: '#3498db' },
    { id: 28, startHoleId: '1:0:main:14:6', endHoleId: '1:0:main:23:6', color: '#9b59b6' },
    { id: 29, startHoleId: '1:0:main:15:6', endHoleId: '1:0:main:25:6', color: '#fdcb6e' },
    { id: 32, startHoleId: '1:0:main:14:3', endHoleId: '1:0:main:27:6', color: '#74b9ff' },
    { id: 33, startHoleId: '1:0:main:13:3', endHoleId: '1:0:main:29:6', color: '#ffeaa7' },
    { id: 34, startHoleId: '1:0:main:12:3', endHoleId: '1:0:main:31:6', color: '#ff7675' },
    { id: 35, startHoleId: '1:0:main:11:3', endHoleId: '1:0:main:33:6', color: '#ffeaa7' },
    { id: 36, startHoleId: '0:0:main:37:6', endHoleId: '0:0:power:44:2', color: '#55efc4' },
    { id: 37, startHoleId: '0:0:power:44:3', endHoleId: '0:0:main:36:6', color: '#3498db' },
    { id: 38, startHoleId: '0:0:main:31:3', endHoleId: '0:0:power:32:0', color: '#3498db' },
    { id: 39, startHoleId: '0:1:main:27:4', endHoleId: '1:0:main:15:3', color: '#f39c12' },
    { id: 41, startHoleId: '0:0:main:30:6', endHoleId: '0:1:main:27:3', color: '#6c5ce7' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  pureDigital: false,
  textBoxes: [
    { id: 1, x: 10, y: -180, w: 316, h: 43, text: 'Title: 8-bit Serial Data Transfer.', v: 2 },
    { id: 2, x: 10, y: -120, w: 1100, h: 100, text: 'Description: Eight switches (D0–D7) on the LEFT board are encoded into a single serial bit stream by a 74x165 (PISO). The serial line carries the bits to a 74x164 (SIPO) on the RIGHT board, which decodes them back into 8 parallel outputs lighting the LEDs Q0–Q7. Only 3 wires cross between the boards: serial data, clock, and ground (shared via the rails).', v: 2 },
    { id: 4, x: 1538, y: -18, w: 408, h: 40, text: 'SIPO DECODER  —  74x164 (serial-in, parallel-out)', v: 2 },
    { id: 5, x: 418, y: 477, w: 132, h: 43, text: 'Load/Reset -&gt;', v: 2 },
    { id: 6, x: 715, y: 293, w: 190, h: 161, text: '&lt;- Serial Load, press 8 times after pressing Load/Reset to to load the state from the switches on the left to LEDs on the right.', v: 2 },
    { id: 7, x: -119, y: 284, w: 134, h: 56, text: 'Input Bits -&gt;', v: 2 },
    { id: 8, x: 808, y: 175, w: 317, h: 71, text: 'PISO DECODER  —  74x165 (parallel-in, serial-out)', v: 2 },
  ],
};


// ── Lesson 12: combination-lock FSM (from CombinationLock-FSM.json) ──────────
// A 3-button combination lock finite state machine. Two CD4013 D flip-flops
// hold the state (stage-1 reached, stage-2 reached, unlocked); CD4081 AND
// gates form the next-state logic (a button only advances the state it is
// supposed to); CD4069 NOT + CD4071 OR catch out-of-order presses and drive
// the active-HIGH reset of every stage. A 74x4538 monostable opens a ~5 s
// RC timing window on button 1 — dawdle past it and the lock resets.
// Buttons: 7=B1, 9=B2, 11=B3. LEDs: 14=green UNLOCK, 16=red LOCKED,
// 18=yellow timer window.

export const COMBO_LOCK_FSM_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 2, row: 4, chipId: '74x4538' },
    { id: 2, type: 'chip', tileX: 0, tileY: 0, col: 12, row: 4, chipId: 'CD4013' },
    { id: 3, type: 'chip', tileX: 0, tileY: 0, col: 21, row: 4, chipId: 'CD4013' },
    { id: 4, type: 'chip', tileX: 0, tileY: 0, col: 30, row: 4, chipId: 'CD4081' },
    { id: 5, type: 'chip', tileX: 0, tileY: 0, col: 39, row: 4, chipId: 'CD4069' },
    { id: 6, type: 'chip', tileX: 0, tileY: 0, col: 48, row: 4, chipId: 'CD4071' },
    { id: 7, type: 'push_button', startHoleId: '0:0:power:14:3', endHoleId: '0:0:main:14:7' },
    { id: 8, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:14:8', endHoleId: '0:0:power:14:2' },
    { id: 9, type: 'push_button', startHoleId: '0:0:power:32:3', endHoleId: '0:0:main:31:7' },
    { id: 10, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:31:8', endHoleId: '0:0:power:32:2' },
    { id: 11, type: 'push_button', startHoleId: '0:0:power:36:3', endHoleId: '0:0:main:35:7' },
    { id: 12, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:35:8', endHoleId: '0:0:power:36:2' },
    { id: 13, type: 'resistor', resistance: 470, startHoleId: '0:0:main:21:6', endHoleId: '0:0:main:20:6' },
    { id: 14, type: 'led', color: 'green', startHoleId: '0:0:main:20:7', endHoleId: '0:0:power:20:2' },
    { id: 15, type: 'resistor', resistance: 470, startHoleId: '0:0:main:22:6', endHoleId: '0:0:main:28:6' },
    { id: 16, type: 'led', color: 'red', startHoleId: '0:0:main:28:7', endHoleId: '0:0:power:28:2' },
    { id: 17, type: 'resistor', resistance: 470, startHoleId: '0:0:main:7:6', endHoleId: '0:0:main:10:6' },
    { id: 18, type: 'led', color: 'yellow', startHoleId: '0:0:main:10:7', endHoleId: '0:0:power:10:2' },
    { id: 19, type: 'capacitor', capacitance: 0.000047, startHoleId: '0:0:main:2:6', endHoleId: '0:0:power:2:2' },
    { id: 20, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:2:7', endHoleId: '0:0:power:2:3' },
    { id: 21, type: 'capacitor', capacitance: 0.000001, startHoleId: '0:0:main:3:0', endHoleId: '0:0:power:3:0' },
    { id: 22, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:3:1', endHoleId: '0:0:power:3:1' },
  ],
  wires: [
    { id: 1,  startHoleId: '0:0:main:2:0',  endHoleId: '0:0:power:2:1',  color: '#ff6b6b' },
    { id: 2,  startHoleId: '0:0:main:9:6',  endHoleId: '0:0:power:9:2',  color: '#2244bb' },
    { id: 3,  startHoleId: '0:0:main:12:0', endHoleId: '0:0:power:12:1', color: '#ff6b6b' },
    { id: 4,  startHoleId: '0:0:main:18:6', endHoleId: '0:0:power:18:2', color: '#2244bb' },
    { id: 5,  startHoleId: '0:0:main:21:0', endHoleId: '0:0:power:21:1', color: '#ff6b6b' },
    { id: 6,  startHoleId: '0:0:main:27:6', endHoleId: '0:0:power:27:2', color: '#2244bb' },
    { id: 7,  startHoleId: '0:0:main:30:0', endHoleId: '0:0:power:30:1', color: '#ff6b6b' },
    { id: 8,  startHoleId: '0:0:main:36:6', endHoleId: '0:0:power:36:2', color: '#2244bb' },
    { id: 9,  startHoleId: '0:0:main:39:0', endHoleId: '0:0:power:39:1', color: '#ff6b6b' },
    { id: 10, startHoleId: '0:0:main:45:6', endHoleId: '0:0:power:45:2', color: '#2244bb' },
    { id: 11, startHoleId: '0:0:main:48:0', endHoleId: '0:0:power:48:1', color: '#ff6b6b' },
    { id: 12, startHoleId: '0:0:main:54:6', endHoleId: '0:0:power:54:2', color: '#2244bb' },
    { id: 13, startHoleId: '0:0:main:4:6',  endHoleId: '0:0:power:4:3',  color: '#ff6b6b' },
    { id: 14, startHoleId: '0:0:main:5:6',  endHoleId: '0:0:power:5:2',  color: '#2244bb' },
    { id: 15, startHoleId: '0:0:main:5:0',  endHoleId: '0:0:power:5:1',  color: '#ff6b6b' },
    { id: 16, startHoleId: '0:0:main:7:0',  endHoleId: '0:0:power:8:1',  color: '#ff6b6b' },
    { id: 17, startHoleId: '0:0:main:7:7',  endHoleId: '0:0:main:6:3',   color: '#e84393' },
    { id: 18, startHoleId: '0:0:main:14:9', endHoleId: '0:0:main:6:9',   color: '#fdcb6e' },
    { id: 19, startHoleId: '0:0:main:16:6', endHoleId: '0:0:power:16:3', color: '#ff6b6b' },
    { id: 20, startHoleId: '0:0:main:17:0', endHoleId: '0:0:power:17:1', color: '#ff6b6b' },
    { id: 21, startHoleId: '0:0:main:25:6', endHoleId: '0:0:power:26:3', color: '#ff6b6b' },
    { id: 22, startHoleId: '0:0:main:17:6', endHoleId: '0:0:power:17:2', color: '#2244bb' },
    { id: 23, startHoleId: '0:0:main:18:0', endHoleId: '0:0:power:18:0', color: '#2244bb' },
    { id: 24, startHoleId: '0:0:main:26:6', endHoleId: '0:0:power:26:2', color: '#2244bb' },
    { id: 25, startHoleId: '0:0:main:12:6', endHoleId: '0:0:main:30:6',  color: '#00b894' },
    { id: 26, startHoleId: '0:0:main:30:7', endHoleId: '0:0:main:39:6',  color: '#00b894' },
    { id: 27, startHoleId: '0:0:main:13:3', endHoleId: '0:0:main:34:6',  color: '#00b894' },
    { id: 28, startHoleId: '0:0:main:34:7', endHoleId: '0:0:main:41:6',  color: '#00b894' },
    { id: 29, startHoleId: '0:0:main:32:6', endHoleId: '0:0:main:15:3',  color: '#6c5ce7' },
    { id: 30, startHoleId: '0:0:main:33:6', endHoleId: '0:0:main:23:6',  color: '#6c5ce7' },
    { id: 31, startHoleId: '0:0:main:40:6', endHoleId: '0:0:main:35:3',  color: '#e17055' },
    { id: 32, startHoleId: '0:0:main:42:6', endHoleId: '0:0:main:31:3',  color: '#e17055' },
    { id: 33, startHoleId: '0:0:main:34:3', endHoleId: '0:0:main:48:6',  color: '#e17055' },
    { id: 34, startHoleId: '0:0:main:33:3', endHoleId: '0:0:main:49:6',  color: '#e17055' },
    { id: 35, startHoleId: '0:0:main:50:6', endHoleId: '0:0:main:52:6',  color: '#e17055' },
    { id: 36, startHoleId: '0:0:main:8:3',  endHoleId: '0:0:main:53:6',  color: '#e84393' },
    { id: 37, startHoleId: '0:0:main:51:6', endHoleId: '0:0:main:15:6',  color: '#d63031' },
    { id: 38, startHoleId: '0:0:main:15:7', endHoleId: '0:0:main:16:3',  color: '#d63031' },
    { id: 39, startHoleId: '0:0:main:15:8', endHoleId: '0:0:main:24:6',  color: '#d63031' },
    { id: 40, startHoleId: '0:0:main:31:9', endHoleId: '0:0:main:36:3',  color: '#fdcb6e' },
    { id: 41, startHoleId: '0:0:main:35:9', endHoleId: '0:0:main:32:3',  color: '#fdcb6e' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  chipFamily: 'LS',
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 180, y: -160, w: 560, h: 44, text: 'Title: Combination-Lock FSM', v: 2 },
    { id: 2, x: 180, y: -110, w: 760, h: 60, text: 'Description: A 3-button combination lock built from AND and NOT gates, D flip-flops, and a real RC timer. Press buttons 1-2-3 in order before the yellow timer LED goes out and the green UNLOCK LED lights; a wrong press (or dawdling) snaps it back to LOCKED.', v: 2 },
  ],
};


// ── Lesson 9: RAM vs ROM side by side (new board) ────────────────────────────
// One 2-bit address (two switches) drives BOTH a 28C16 EEPROM (wired
// read-only: CE=OE=GND, WE=VCC) and a 74x219 RAM. The ROM's data outputs
// IO0-IO3 light the red LEDs AND feed the RAM's D1-D4 inputs, so pressing
// COPY (RAM WE LOW) stores the ROM's current word into the RAM at the same
// address; the RAM's Q1-Q4 light the green LEDs. ROM preloaded: addr 0→0,
// 1→6, 2→9, 3→15. RAM starts empty (that's the point — it's volatile).

export const MEM_INTRO_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 4, row: 4, chipId: '28C16',
      ffState: { IO0_eeprom2k: { mem: {
        0: [0, 0, 0, 0, 0, 0, 0, 0],
        1: [0, 1, 1, 0, 0, 0, 0, 0],
        2: [1, 0, 0, 1, 0, 0, 0, 0],
        3: [1, 1, 1, 1, 0, 0, 0, 0],
      } } } },
    { id: 2, type: 'chip', tileX: 0, tileY: 0, col: 24, row: 4, chipId: '74x219' },
    // Address switches (shared by both chips): ON = HIGH
    { id: 10, type: 'switch', on: false, startHoleId: '0:0:power:11:3', endHoleId: '0:0:main:11:9' },
    { id: 11, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:11:8', endHoleId: '0:0:power:11:2' },
    { id: 12, type: 'switch', on: false, startHoleId: '0:0:power:10:3', endHoleId: '0:0:main:10:9' },
    { id: 13, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:10:8', endHoleId: '0:0:power:10:2' },
    // COPY button (RAM WE, active LOW) with pull-up so it idles in read mode
    { id: 14, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:31:2', endHoleId: '0:0:power:31:1' },
    { id: 15, type: 'push_button', startHoleId: '0:0:main:31:0', endHoleId: '0:0:power:31:0' },
    // ROM data LEDs (IO0-IO3)
    { id: 20, type: 'led', color: 'red', startHoleId: '0:0:main:17:0', endHoleId: '0:0:power:17:0' },
    { id: 21, type: 'led', color: 'red', startHoleId: '0:0:main:18:0', endHoleId: '0:0:power:18:0' },
    { id: 22, type: 'led', color: 'red', startHoleId: '0:0:main:19:0', endHoleId: '0:0:power:19:0' },
    { id: 23, type: 'led', color: 'red', startHoleId: '0:0:main:20:0', endHoleId: '0:0:power:20:0' },
    // RAM data LEDs (Q1-Q4)
    { id: 24, type: 'led', color: 'green', startHoleId: '0:0:main:34:0', endHoleId: '0:0:power:34:0' },
    { id: 25, type: 'led', color: 'green', startHoleId: '0:0:main:35:0', endHoleId: '0:0:power:35:0' },
    { id: 26, type: 'led', color: 'green', startHoleId: '0:0:main:36:0', endHoleId: '0:0:power:36:0' },
    { id: 27, type: 'led', color: 'green', startHoleId: '0:0:main:37:0', endHoleId: '0:0:power:37:0' },
  ],
  wires: [
    // ── ROM power + control: permanently in read mode ──
    { id: 1, startHoleId: '0:0:power:4:1', endHoleId: '0:0:main:4:3', color: '#e74c3c' },   // VCC (pin 24)
    { id: 2, startHoleId: '0:0:main:15:7', endHoleId: '0:0:power:15:2', color: '#27ae60' }, // GND (pin 12)
    { id: 3, startHoleId: '0:0:main:10:2', endHoleId: '0:0:power:10:0', color: '#27ae60' }, // CE = LOW (enabled)
    { id: 4, startHoleId: '0:0:main:8:2', endHoleId: '0:0:power:8:0', color: '#27ae60' },   // OE = LOW (outputs on)
    { id: 5, startHoleId: '0:0:main:5:2', endHoleId: '0:0:power:5:1', color: '#e74c3c' },   // WE = HIGH (never write)
    // Unused ROM address bits tied LOW
    { id: 6, startHoleId: '0:0:main:9:2', endHoleId: '0:0:power:9:0', color: '#555555' },   // A10
    { id: 7, startHoleId: '0:0:main:7:2', endHoleId: '0:0:power:7:0', color: '#555555' },   // A9
    { id: 8, startHoleId: '0:0:main:6:2', endHoleId: '0:0:power:6:0', color: '#555555' },   // A8
    { id: 9, startHoleId: '0:0:main:4:7', endHoleId: '0:0:power:4:2', color: '#555555' },   // A7
    { id: 10, startHoleId: '0:0:main:5:7', endHoleId: '0:0:power:5:2', color: '#555555' },  // A6
    { id: 11, startHoleId: '0:0:main:6:7', endHoleId: '0:0:power:6:2', color: '#555555' },  // A5
    { id: 12, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2', color: '#555555' },  // A4
    { id: 13, startHoleId: '0:0:main:8:7', endHoleId: '0:0:power:8:2', color: '#555555' },  // A3
    { id: 14, startHoleId: '0:0:main:9:7', endHoleId: '0:0:power:9:2', color: '#555555' },  // A2
    // ROM data → red LEDs
    { id: 15, startHoleId: '0:0:main:12:7', endHoleId: '0:0:main:17:1', color: '#74b9ff' }, // IO0
    { id: 16, startHoleId: '0:0:main:13:7', endHoleId: '0:0:main:18:1', color: '#74b9ff' }, // IO1
    { id: 17, startHoleId: '0:0:main:14:7', endHoleId: '0:0:main:19:1', color: '#74b9ff' }, // IO2
    { id: 18, startHoleId: '0:0:main:15:2', endHoleId: '0:0:main:20:1', color: '#74b9ff' }, // IO3
    // ── RAM power + control ──
    { id: 19, startHoleId: '0:0:power:24:1', endHoleId: '0:0:main:24:3', color: '#e74c3c' }, // VCC (pin 16)
    { id: 20, startHoleId: '0:0:main:31:7', endHoleId: '0:0:power:31:2', color: '#27ae60' }, // GND (pin 8)
    { id: 21, startHoleId: '0:0:main:30:7', endHoleId: '0:0:power:30:2', color: '#27ae60' }, // CS = LOW (enabled)
    { id: 22, startHoleId: '0:0:main:25:2', endHoleId: '0:0:power:25:0', color: '#555555' }, // A3 = LOW
    { id: 23, startHoleId: '0:0:main:28:2', endHoleId: '0:0:power:28:0', color: '#555555' }, // A2 = LOW
    // Shared address bus (switch strips → RAM A0/A1)
    { id: 24, startHoleId: '0:0:main:11:7', endHoleId: '0:0:main:24:7', color: '#a29bfe' },  // A0
    { id: 25, startHoleId: '0:0:main:10:7', endHoleId: '0:0:main:27:7', color: '#a29bfe' },  // A1
    // ROM data bus → RAM data inputs (the COPY path)
    { id: 26, startHoleId: '0:0:main:26:7', endHoleId: '0:0:main:12:8', color: '#f39c12' },  // IO0 → D1
    { id: 27, startHoleId: '0:0:main:29:7', endHoleId: '0:0:main:13:8', color: '#f39c12' },  // IO1 → D2
    { id: 28, startHoleId: '0:0:main:30:2', endHoleId: '0:0:main:14:8', color: '#f39c12' },  // IO2 → D3
    { id: 29, startHoleId: '0:0:main:27:2', endHoleId: '0:0:main:15:1', color: '#f39c12' },  // IO3 → D4
    // RAM data → green LEDs
    { id: 30, startHoleId: '0:0:main:25:7', endHoleId: '0:0:main:34:1', color: '#55efc4' },  // Q1
    { id: 31, startHoleId: '0:0:main:28:7', endHoleId: '0:0:main:35:1', color: '#55efc4' },  // Q2
    { id: 32, startHoleId: '0:0:main:29:2', endHoleId: '0:0:main:36:1', color: '#55efc4' },  // Q3
    { id: 33, startHoleId: '0:0:main:26:2', endHoleId: '0:0:main:37:1', color: '#55efc4' },  // Q4
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 10, y: -180, w: 500, h: 44, text: 'Title: RAM vs ROM', v: 2 },
    { id: 2, x: 10, y: -130, w: 900, h: 60, text: 'Description: The two ADDRESS switches select one of 4 locations in BOTH chips at once. Red LEDs = the ROM word stored there (fixed). Green LEDs = the RAM word (starts empty).', v: 2 },
    { id: 3, x: 10, y: 430, w: 900, h: 90, text: 'Details: The ROM (28C16 EEPROM, left) is wired read-only: its data comes out no matter what, and you cannot change it from this board. The RAM (74x219, right) starts blank because RAM forgets everything at power-off. Press COPY to write the ROM word into the RAM at the current address — that is exactly how real computers shadow firmware from ROM into RAM at boot.', v: 2 },
    { id: 4, x: 235, y: 400, w: 150, h: 36, text: 'ADDRESS ->', v: 2 },
    { id: 5, x: 700, y: 30, w: 170, h: 60, text: '^ COPY (writes RAM)', v: 2 },
    { id: 6, x: 370, y: 30, w: 140, h: 36, text: 'ROM word', v: 2 },
    { id: 7, x: 710, y: 90, w: 140, h: 36, text: 'RAM word', v: 2 },
  ],
};


// ── Lesson 10: ROM as a lookup table (new board) ─────────────────────────────
// A 28C16 EEPROM wired permanently in read mode. Three address switches
// (A0-A2) select one of 8 locations; the stored byte drives 8 red LEDs.
// Preloaded with the SQUARES of the address: mem[n] = n² (0,1,4,9,…,49),
// so the board literally computes x² by looking the answer up.

export const ROM_DEMO_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 20, row: 4, chipId: '28C16',
      ffState: { IO0_eeprom2k: { mem: {
        0: [0, 0, 0, 0, 0, 0, 0, 0],  //  0² = 0
        1: [1, 0, 0, 0, 0, 0, 0, 0],  //  1² = 1
        2: [0, 0, 1, 0, 0, 0, 0, 0],  //  2² = 4
        3: [1, 0, 0, 1, 0, 0, 0, 0],  //  3² = 9
        4: [0, 0, 0, 0, 1, 0, 0, 0],  //  4² = 16
        5: [1, 0, 0, 1, 1, 0, 0, 0],  //  5² = 25
        6: [0, 0, 1, 0, 0, 1, 0, 0],  //  6² = 36
        7: [1, 0, 0, 0, 1, 1, 0, 0],  //  7² = 49
      } } } },
    // Address switches A0 (col 27), A1 (col 26), A2 (col 25): ON = HIGH
    { id: 10, type: 'switch', on: false, startHoleId: '0:0:power:27:3', endHoleId: '0:0:main:27:9' },
    { id: 11, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:27:8', endHoleId: '0:0:power:27:2' },
    { id: 12, type: 'switch', on: false, startHoleId: '0:0:power:26:3', endHoleId: '0:0:main:26:9' },
    { id: 13, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:26:8', endHoleId: '0:0:power:26:2' },
    { id: 14, type: 'switch', on: false, startHoleId: '0:0:power:25:3', endHoleId: '0:0:main:25:9' },
    { id: 15, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:25:8', endHoleId: '0:0:power:25:2' },
    // Data LEDs IO0 (col 36) … IO7 (col 43)
    { id: 20, type: 'led', color: 'red', startHoleId: '0:0:main:36:0', endHoleId: '0:0:power:36:0' },
    { id: 21, type: 'led', color: 'red', startHoleId: '0:0:main:37:0', endHoleId: '0:0:power:37:0' },
    { id: 22, type: 'led', color: 'red', startHoleId: '0:0:main:38:0', endHoleId: '0:0:power:38:0' },
    { id: 23, type: 'led', color: 'red', startHoleId: '0:0:main:39:0', endHoleId: '0:0:power:39:0' },
    { id: 24, type: 'led', color: 'red', startHoleId: '0:0:main:40:0', endHoleId: '0:0:power:40:0' },
    { id: 25, type: 'led', color: 'red', startHoleId: '0:0:main:41:0', endHoleId: '0:0:power:41:0' },
    { id: 26, type: 'led', color: 'red', startHoleId: '0:0:main:42:0', endHoleId: '0:0:power:42:0' },
    { id: 27, type: 'led', color: 'red', startHoleId: '0:0:main:43:0', endHoleId: '0:0:power:43:0' },
  ],
  wires: [
    // Power + control: read mode forever (CE=0, OE=0, WE=1)
    { id: 1, startHoleId: '0:0:power:20:1', endHoleId: '0:0:main:20:3', color: '#e74c3c' },  // VCC (pin 24)
    { id: 2, startHoleId: '0:0:main:31:7', endHoleId: '0:0:power:31:2', color: '#27ae60' },  // GND (pin 12)
    { id: 3, startHoleId: '0:0:main:26:2', endHoleId: '0:0:power:26:0', color: '#27ae60' },  // CE = LOW
    { id: 4, startHoleId: '0:0:main:24:2', endHoleId: '0:0:power:24:0', color: '#27ae60' },  // OE = LOW
    { id: 5, startHoleId: '0:0:main:21:2', endHoleId: '0:0:power:21:1', color: '#e74c3c' },  // WE = HIGH
    // Unused address bits tied LOW
    { id: 6, startHoleId: '0:0:main:25:2', endHoleId: '0:0:power:25:0', color: '#555555' },  // A10
    { id: 7, startHoleId: '0:0:main:23:2', endHoleId: '0:0:power:23:0', color: '#555555' },  // A9
    { id: 8, startHoleId: '0:0:main:22:2', endHoleId: '0:0:power:22:0', color: '#555555' },  // A8
    { id: 9, startHoleId: '0:0:main:20:7', endHoleId: '0:0:power:20:2', color: '#555555' },  // A7
    { id: 10, startHoleId: '0:0:main:21:7', endHoleId: '0:0:power:21:2', color: '#555555' }, // A6
    { id: 11, startHoleId: '0:0:main:22:7', endHoleId: '0:0:power:22:2', color: '#555555' }, // A5
    { id: 12, startHoleId: '0:0:main:23:7', endHoleId: '0:0:power:23:2', color: '#555555' }, // A4
    { id: 13, startHoleId: '0:0:main:24:7', endHoleId: '0:0:power:24:2', color: '#555555' }, // A3
    // Data byte → LEDs (IO0 = least-significant bit, leftmost LED)
    { id: 14, startHoleId: '0:0:main:28:7', endHoleId: '0:0:main:36:1', color: '#74b9ff' },  // IO0
    { id: 15, startHoleId: '0:0:main:29:7', endHoleId: '0:0:main:37:1', color: '#74b9ff' },  // IO1
    { id: 16, startHoleId: '0:0:main:30:7', endHoleId: '0:0:main:38:1', color: '#74b9ff' },  // IO2
    { id: 17, startHoleId: '0:0:main:31:2', endHoleId: '0:0:main:39:1', color: '#74b9ff' },  // IO3
    { id: 18, startHoleId: '0:0:main:30:2', endHoleId: '0:0:main:40:1', color: '#74b9ff' },  // IO4
    { id: 19, startHoleId: '0:0:main:29:2', endHoleId: '0:0:main:41:1', color: '#74b9ff' },  // IO5
    { id: 20, startHoleId: '0:0:main:28:2', endHoleId: '0:0:main:42:1', color: '#74b9ff' },  // IO6
    { id: 21, startHoleId: '0:0:main:27:2', endHoleId: '0:0:main:43:1', color: '#74b9ff' },  // IO7
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 10, y: -180, w: 560, h: 44, text: 'Title: ROM Lookup Table — x squared', v: 2 },
    { id: 2, x: 10, y: -130, w: 900, h: 60, text: 'Description: The three ADDRESS switches form a 3-bit number x (0–7). The EEPROM was programmed so that location x stores x·x — the red LEDs show the answer in binary (leftmost LED = 1s bit).', v: 2 },
    { id: 3, x: 10, y: 430, w: 900, h: 80, text: 'Details: CE and OE are tied LOW and WE is tied HIGH, so the chip is permanently in read mode — from this board the contents can never change. Try x = 5: switches ON-OFF-ON reads out 25 (LEDs 1,4,5 from the left). No gates compute anything; the answer was simply stored in advance.', v: 2 },
    { id: 4, x: 535, y: 400, w: 160, h: 36, text: 'ADDRESS x ->', v: 2 },
    { id: 5, x: 745, y: 30, w: 200, h: 36, text: 'DATA x·x (binary)', v: 2 },
  ],
};


// ── Lesson 11: RAM read/write (new board) ────────────────────────────────────
// A 74x219 16×4 RAM. Two ADDRESS switches (A0/A1) select one of 4 cells;
// two DATA switches set D1/D2; the WRITE button pulls WE LOW to store.
// Q1/Q2 drive the green LEDs — note they go dark while WRITE is held,
// because the tri-state outputs disconnect during a write cycle.

export const RAM_DEMO_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 22, row: 4, chipId: '74x219' },
    // ADDRESS switches: A0 (col 22), A1 (col 25). ON = HIGH
    { id: 10, type: 'switch', on: false, startHoleId: '0:0:power:22:3', endHoleId: '0:0:main:22:9' },
    { id: 11, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:22:8', endHoleId: '0:0:power:22:2' },
    { id: 12, type: 'switch', on: false, startHoleId: '0:0:power:25:3', endHoleId: '0:0:main:25:9' },
    { id: 13, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:25:8', endHoleId: '0:0:power:25:2' },
    // DATA switches: D1 (col 24), D2 (col 27). ON = HIGH
    { id: 14, type: 'switch', on: false, startHoleId: '0:0:power:24:3', endHoleId: '0:0:main:24:9' },
    { id: 15, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:24:8', endHoleId: '0:0:power:24:2' },
    { id: 16, type: 'switch', on: false, startHoleId: '0:0:power:27:3', endHoleId: '0:0:main:27:9' },
    { id: 17, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:27:8', endHoleId: '0:0:power:27:2' },
    // WRITE button (WE active LOW) with pull-up so it idles in read mode
    { id: 18, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:29:2', endHoleId: '0:0:power:29:1' },
    { id: 19, type: 'push_button', startHoleId: '0:0:main:29:0', endHoleId: '0:0:power:29:0' },
    // Stored-data LEDs (Q1, Q2)
    { id: 20, type: 'led', color: 'green', startHoleId: '0:0:main:34:0', endHoleId: '0:0:power:34:0' },
    { id: 21, type: 'led', color: 'green', startHoleId: '0:0:main:36:0', endHoleId: '0:0:power:36:0' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:22:1', endHoleId: '0:0:main:22:3', color: '#e74c3c' },  // VCC (pin 16)
    { id: 2, startHoleId: '0:0:main:29:7', endHoleId: '0:0:power:29:2', color: '#27ae60' },  // GND (pin 8)
    { id: 3, startHoleId: '0:0:main:28:7', endHoleId: '0:0:power:28:2', color: '#27ae60' },  // CS = LOW (enabled)
    { id: 4, startHoleId: '0:0:main:23:2', endHoleId: '0:0:power:23:0', color: '#555555' },  // A3 = LOW
    { id: 5, startHoleId: '0:0:main:26:2', endHoleId: '0:0:power:26:0', color: '#555555' },  // A2 = LOW
    { id: 6, startHoleId: '0:0:main:25:2', endHoleId: '0:0:power:25:0', color: '#555555' },  // D4 = LOW
    { id: 7, startHoleId: '0:0:main:28:2', endHoleId: '0:0:power:28:0', color: '#555555' },  // D3 = LOW
    { id: 8, startHoleId: '0:0:main:23:7', endHoleId: '0:0:main:34:1', color: '#55efc4' },   // Q1 → LED
    { id: 9, startHoleId: '0:0:main:26:7', endHoleId: '0:0:main:36:1', color: '#55efc4' },   // Q2 → LED
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 10, y: -180, w: 560, h: 44, text: 'Title: RAM — Write It, Then Read It Back', v: 2 },
    { id: 2, x: 10, y: -130, w: 900, h: 70, text: 'Description: ADDRESS switches (cols 1 and 4 of the switch row) pick one of 4 cells. DATA switches (cols 2 and 5) set the 2-bit value. Hold WRITE to store it; release to read. The green LEDs always show what is stored at the current address.', v: 2 },
    { id: 3, x: 10, y: 430, w: 900, h: 90, text: 'Details: WE has a pull-up, so the chip idles in READ mode and the LEDs show the current cell. Pressing WRITE pulls WE LOW: the D inputs are stored and the Q outputs go tri-state (LEDs dark) for the duration — data cannot flow both ways at once. Change the address and come back: the value is still there. Cut the power and it would be gone; RAM is volatile.', v: 2 },
    { id: 4, x: 455, y: 400, w: 380, h: 36, text: 'A0  D1  A1  D2   (switches, left to right)', v: 2 },
    { id: 5, x: 620, y: 30, w: 180, h: 36, text: '^ WRITE button', v: 2 },
    { id: 6, x: 705, y: 90, w: 170, h: 36, text: 'STORED word', v: 2 },
  ],
};


// ── Lesson 6: Glitches & Hazards — hand-stepped static-1 hazard ──────────────
// A 2-way selector Y = (A AND SEL) OR (B AND SELB) built from a 74x08 and a
// 74x32, with both data inputs tied HIGH. SEL and SELB are separate toggle
// switches: in a real circuit SELB would come from an inverter on SEL, but the
// engine is zero-delay (issues.md A1), so the learner plays the slow inverter
// by flipping the two switches in sequence — freezing the hazard window in
// time. Y drives the green LED and the CLK of a CD4013 wired as a toggle
// (Q-bar → D, same trick as the Lesson 4 coin toss): every hand-stepped glitch
// clocks it, and the red LED flips — proof the glitch counts as a real edge.
// Verified by js/debug/scenarios/onramp-lesson-boards.mjs.

export const GLITCH_HAZARD_BOARD = {
  version: 1,
  components: [
    { id: 1, type: 'chip', tileX: 0, tileY: 0, col: 4, row: 4, chipId: '74x08' },
    { id: 2, type: 'chip', tileX: 0, tileY: 0, col: 14, row: 4, chipId: '74x32' },
    { id: 3, type: 'chip', tileX: 0, tileY: 0, col: 24, row: 4, chipId: 'CD4013' },
    // SEL switch (starts ON) + pull-down
    { id: 10, type: 'switch', on: true, startHoleId: '0:0:main:0:2', endHoleId: '0:0:power:0:1' },
    { id: 11, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:0:3', endHoleId: '0:0:power:0:0' },
    // SELB switch (starts OFF) + pull-down
    { id: 12, type: 'switch', on: false, startHoleId: '0:0:main:2:2', endHoleId: '0:0:power:2:1' },
    { id: 13, type: 'resistor', resistance: 10000, startHoleId: '0:0:main:2:3', endHoleId: '0:0:power:2:0' },
    // Y LED (green, col 33)
    { id: 20, type: 'resistor', resistance: 470, startHoleId: '0:0:main:16:7', endHoleId: '0:0:main:33:6' },
    { id: 21, type: 'led', color: 'green', startHoleId: '0:0:main:33:7', endHoleId: '0:0:power:33:2' },
    // Glitch-counter LED (red, col 36) on CD4013 Q
    { id: 22, type: 'resistor', resistance: 470, startHoleId: '0:0:main:24:7', endHoleId: '0:0:main:36:6' },
    { id: 23, type: 'led', color: 'red', startHoleId: '0:0:main:36:7', endHoleId: '0:0:power:36:2' },
  ],
  wires: [
    // Chip power
    { id: 1, startHoleId: '0:0:main:4:3', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
    { id: 2, startHoleId: '0:0:main:10:9', endHoleId: '0:0:power:10:2', color: '#2244bb' },
    { id: 3, startHoleId: '0:0:main:14:3', endHoleId: '0:0:power:14:1', color: '#e74c3c' },
    { id: 4, startHoleId: '0:0:main:20:9', endHoleId: '0:0:power:20:2', color: '#2244bb' },
    { id: 5, startHoleId: '0:0:main:24:3', endHoleId: '0:0:power:24:1', color: '#e74c3c' },
    { id: 6, startHoleId: '0:0:main:30:9', endHoleId: '0:0:power:30:2', color: '#2244bb' },
    // Data inputs A (1A, pin 1) and B (2A, pin 4) tied HIGH
    { id: 7, startHoleId: '0:0:main:4:6', endHoleId: '0:0:power:4:3', color: '#e74c3c' },
    { id: 8, startHoleId: '0:0:main:7:6', endHoleId: '0:0:power:7:3', color: '#e74c3c' },
    // SEL → 1B (pin 2), SELB → 2B (pin 5)
    { id: 9, startHoleId: '0:0:main:0:1', endHoleId: '0:0:main:5:6', color: '#fdcb6e' },
    { id: 10, startHoleId: '0:0:main:2:1', endHoleId: '0:0:main:8:6', color: '#9b59b6' },
    // AND outputs → OR inputs: 1Y → 74x32 1A, 2Y → 74x32 1B
    { id: 11, startHoleId: '0:0:main:6:6', endHoleId: '0:0:main:14:6', color: '#00b894' },
    { id: 12, startHoleId: '0:0:main:9:6', endHoleId: '0:0:main:15:6', color: '#00b894' },
    // Y = 74x32 1Y → CD4013 CLK1 (pin 3)
    { id: 13, startHoleId: '0:0:main:16:6', endHoleId: '0:0:main:26:6', color: '#3498db' },
    // Toggle wiring: Q-bar (pin 2) → D (pin 5); SET and RESET tied LOW
    { id: 14, startHoleId: '0:0:main:28:6', endHoleId: '0:0:main:25:6', color: '#fdcb6e' },
    { id: 15, startHoleId: '0:0:main:29:7', endHoleId: '0:0:power:29:2', color: '#2244bb' },
    { id: 16, startHoleId: '0:0:main:27:7', endHoleId: '0:0:power:27:2', color: '#2244bb' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [
    { id: 1, x: 180, y: -150, w: 560, h: 44, text: 'Title: Glitch, Frozen in Time', v: 2 },
    { id: 2, x: 180, y: -100, w: 860, h: 60, text: 'Description: A 2-way selector picking between two HIGH inputs. The two switches are SEL (left) and what its inverter *should* output (right) - you play the slow inverter by flipping them one at a time.', v: 2 },
    { id: 3, x: -60, y: 400, w: 340, h: 36, text: 'switches: SEL (left), inverter out (right)', v: 2 },
    { id: 4, x: 620, y: 400, w: 170, h: 36, text: '^ Y (should stay ON)', v: 2 },
    { id: 5, x: 700, y: 445, w: 260, h: 36, text: '^ glitch counter (toggles on Y edges)', v: 2 },
  ],
};
