// ── 74 Series Chip Registry ──────────────────────────────────────────────────
// Each entry defines the chip's pin count, pinout, logical gates, and search tags.
// Pin numbering follows standard DIP convention:
//   Pins 1...N/2 are on the left side (top to bottom),
//   Pins N/2+1...N are on the right side (bottom to top).
// pinout[]: index 0 = pin 1, index 1 = pin 2, etc.
// gates[]: each gate is { type, inputs: [pinName...], output: pinName }

import { CHIPS_BLOCK_1 } from './chips/chips1.js';
import { CHIPS_BLOCK_2 } from './chips/chips2.js';
import { CHIPS_BLOCK_3 } from './chips/chips3.js';
import { CHIPS_BLOCK_4 } from './chips/chips4.js';
import { CHIPS_BLOCK_5 } from './chips/chips5.js';
import { CHIPS_BLOCK_6 } from './chips/chips6.js';
import { CHIPS_BLOCK_7 } from './chips/chips7.js';
import { CHIPS_BLOCK_8 } from './chips/chips8.js';
import { CHIPS_BLOCK_9 } from './chips/chips9.js';
import { CHIPS_BLOCK_10 } from './chips/chips10.js';
import { CHIPS_BLOCK_11 } from './chips/chips11.js';
import { CHIPS_BLOCK_12 } from './chips/chips12.js';
import { CHIPS_BLOCK_13 } from './chips/chips13.js';
import { CHIPS_BLOCK_14 } from './chips/chips14.js';
import { CHIPS_BLOCK_15 } from './chips/chips15.js';
import { CHIPS_BLOCK_16 } from './chips/chips16.js';
import { CHIPS_BLOCK_17 } from './chips/chips17.js';
import { CHIPS_BLOCK_18 } from './chips/chips18.js';
import { CHIPS_BLOCK_19 } from './chips/chips19.js';
import { CHIPS_BLOCK_20 } from './chips/chips20.js';
import { CHIPS_BLOCK_21 } from './chips/chips21.js';
import { CHIPS_BLOCK_22 } from './chips/chips22.js';
import { CHIPS_BLOCK_23 } from './chips/chips23.js';
import { CHIPS_BLOCK_24 } from './chips/chips24.js';
import { CHIPS_BLOCK_25 } from './chips/chips25.js';
import { CHIPS_BLOCK_26 } from './chips/chips26.js';
import { CHIPS_BLOCK_27 } from './chips/chips27.js';
import { CHIPS_BLOCK_28 } from './chips/chips28.js';
import { CHIPS_BLOCK_29 } from './chips/chips29.js';
import { CHIPS_BLOCK_30 } from './chips/chips30.js';
import { CHIPS_BLOCK_31 } from './chips/chips31.js';
import { CHIPS_BLOCK_32 } from './chips/chips32.js';
import { CHIPS_BLOCK_33 } from './chips/chips33.js';
import { CHIPS_BLOCK_34 } from './chips/chips34.js';
import { CHIPS_BLOCK_35 } from './chips/chips35.js';
import { CHIPS_BLOCK_36 } from './chips/chips36.js';
import { CHIPS_BLOCK_37 } from './chips/chips37.js';
import { CHIPS_BLOCK_38 } from './chips/chips38.js';
import { CHIPS_BLOCK_39 } from './chips/chips39.js';
import { CHIPS_BLOCK_40 } from './chips/chips40.js';
import { CHIPS_BLOCK_41 } from './chips/chips41.js';
import { CHIPS_BLOCK_42 } from './chips/chips42.js';
import { CHIPS_BLOCK_43 } from './chips/chips43.js';
import { CHIPS_BLOCK_44 } from './chips/chips44.js';
import { CHIPS_BLOCK_45 } from './chips/chips45.js';
import { CHIPS_BLOCK_46 } from './chips/chips46.js';
import { CHIPS_BLOCK_47 } from './chips/chips47.js';
import { CHIPS_BLOCK_48 } from './chips/chips48.js';
import { CHIPS_BLOCK_49 } from './chips/chips49.js';
import { CHIPS_BLOCK_50 } from './chips/chips50.js';
import { CHIPS_BLOCK_51 } from './chips/chips51.js';
import { CHIPS_BLOCK_52 } from './chips/chips52.js';
import { CHIPS_BLOCK_53 } from './chips/chips53.js';
import { CHIPS_BLOCK_54 } from './chips/chips54.js';
import { CHIPS_BLOCK_55 } from './chips/chips55.js';
import { CHIPS_BLOCK_56 } from './chips/chips56.js';
import { CHIPS_BLOCK_57 } from './chips/chips57.js';
import { CHIPS_BLOCK_58 } from './chips/chips58.js';
import { CHIPS_BLOCK_59 } from './chips/chips59.js';
import { CHIPS_BLOCK_60 } from './chips/chips60.js';
import { CHIPS_BLOCK_61 } from './chips/chips61.js';
import { CHIPS_BLOCK_62 } from './chips/chips62.js';
import { CHIPS_BLOCK_63 } from './chips/chips63.js';
import { CHIPS_BLOCK_64 } from './chips/chips64.js';
import { CHIPS_BLOCK_65 } from './chips/chips65.js';
import { CHIPS_BLOCK_66 } from './chips/chips66.js';
import { CHIPS_BLOCK_67 } from './chips/chips67.js';
import { CHIPS_BLOCK_68 } from './chips/chips68.js';
import { CHIPS_BLOCK_69 } from './chips/chips69.js';

const CHIP_DB = {
  ...CHIPS_BLOCK_1,
  ...CHIPS_BLOCK_2,
  ...CHIPS_BLOCK_3,
  ...CHIPS_BLOCK_4,
  ...CHIPS_BLOCK_5,
  ...CHIPS_BLOCK_6,
  ...CHIPS_BLOCK_7,
  ...CHIPS_BLOCK_8,
  ...CHIPS_BLOCK_9,
  ...CHIPS_BLOCK_10,
  ...CHIPS_BLOCK_11,
  ...CHIPS_BLOCK_12,
  ...CHIPS_BLOCK_13,
  ...CHIPS_BLOCK_14,
  ...CHIPS_BLOCK_15,
  ...CHIPS_BLOCK_16,
  ...CHIPS_BLOCK_17,
  ...CHIPS_BLOCK_18,
  ...CHIPS_BLOCK_19,
  ...CHIPS_BLOCK_20,
  ...CHIPS_BLOCK_21,
  ...CHIPS_BLOCK_22,
  ...CHIPS_BLOCK_23,
  ...CHIPS_BLOCK_24,
  ...CHIPS_BLOCK_25,
  ...CHIPS_BLOCK_26,
  ...CHIPS_BLOCK_27,
  ...CHIPS_BLOCK_28,
  ...CHIPS_BLOCK_29,
  ...CHIPS_BLOCK_30,
  ...CHIPS_BLOCK_31,
  ...CHIPS_BLOCK_32,
  ...CHIPS_BLOCK_33,
  ...CHIPS_BLOCK_34,
  ...CHIPS_BLOCK_35,
  ...CHIPS_BLOCK_36,
  ...CHIPS_BLOCK_37,
  ...CHIPS_BLOCK_38,
  ...CHIPS_BLOCK_39,
  ...CHIPS_BLOCK_40,
  ...CHIPS_BLOCK_41,
  ...CHIPS_BLOCK_42,
  ...CHIPS_BLOCK_43,
  ...CHIPS_BLOCK_44,
  ...CHIPS_BLOCK_45,
  ...CHIPS_BLOCK_46,
  ...CHIPS_BLOCK_47,
  ...CHIPS_BLOCK_48,
  ...CHIPS_BLOCK_49,
  ...CHIPS_BLOCK_50,
  ...CHIPS_BLOCK_51,
  ...CHIPS_BLOCK_52,
  ...CHIPS_BLOCK_53,
  ...CHIPS_BLOCK_54,
  ...CHIPS_BLOCK_55,
  ...CHIPS_BLOCK_56,
  ...CHIPS_BLOCK_57,
  ...CHIPS_BLOCK_58,
  ...CHIPS_BLOCK_59,
  ...CHIPS_BLOCK_60,
  ...CHIPS_BLOCK_61,
  ...CHIPS_BLOCK_62,
  ...CHIPS_BLOCK_63,
  ...CHIPS_BLOCK_64,
  ...CHIPS_BLOCK_65,
  ...CHIPS_BLOCK_66,
  ...CHIPS_BLOCK_67,
  ...CHIPS_BLOCK_68,
  ...CHIPS_BLOCK_69,
};


// ── Chip Registry API ────────────────────────────────────────────────────────

export function getChipDef(chipId) {
  return CHIP_DB[chipId] || null;
}

export function getAllChipIds() {
  return Object.keys(CHIP_DB);
}

// Returns a match quality score (lower = better). Infinity = no match.
// 0=exact, 1=starts-with, 2=word-boundary-contains, 3=contains, 4=subsequence
function _fuzzyScore(text, q) {
  if (!text) return Infinity;
  const t = text.toLowerCase();
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (/[\s\-_]/.test(t.charAt(t.indexOf(q) - 1)) && t.includes(q)) return 2;
  if (t.includes(q)) return 3;
  // subsequence
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 4 : Infinity;
}

// Extract the primary numeric part of a chip ID for number-based sorting.
// Sort order: 74x### / 74### (by trailing number), then 555, then CD#### (by trailing number).
function _chipNumber(id) {
  // 74x### or 74### sort by the numeric suffix after the prefix letters
  const m74x = id.match(/^74[x]?[a-zA-Z]*(\d+)/i);
  if (m74x) return parseInt(m74x[1], 10);
  // 555 timer place after 74x series
  if (id === '555') return 100000;
  // CD#### sort by trailing number, placed after 555
  const mCD = id.match(/^[Cc][Dd](\d+)/);
  if (mCD) return 200000 + parseInt(mCD[1], 10);
  // Fallback
  const m = id.match(/\d+/);
  return m ? 300000 + parseInt(m[0], 10) : 999999;
}

// Static popularity ranking   most-used chips first. Anything not listed here
// falls back to chip-number order. Curated based on hobbyist/teaching/industry
// usage of 74 series TTL, 4000-series CMOS, and 555-family timer chips.
export const CHIP_POPULARITY_RANK = [
  '555',     // 555 timer   the most-used IC in history
  '7400',    // quad 2-input NAND   the canonical TTL chip
  '7404',    // hex inverter
  '7408',    // quad 2-input AND
  '7402',    // quad 2-input NOR
  '7432',    // quad 2-input OR
  '7486',    // quad 2-input XOR
  '74595',   // 8 bit serial-in/parallel-out shift register (maker favourite)
  '7474',    // dual D flip-flop
  '7414',    // hex Schmitt-trigger inverter
  '74161',   // 4 bit synchronous binary counter (async clear)
  '74163',   // 4 bit synchronous binary counter (sync clear)
  '74138',   // 3-to-8 line decoder
  '74157',   // quad 2-to-1 multiplexer
  '74151',   // 8-to-1 multiplexer
  '74148',   // 8-to-3 priority encoder
  '7447',    // BCD-to-7-segment decoder/driver
  '7490',    // decade counter (classic teaching chip)
  '7493',    // 4 bit binary counter
  '74193',   // 4 bit synchronous up/down counter
  '74283',   // 4 bit binary full adder with fast carry
  '7483',    // 4 bit binary full adder
  '7485',    // 4 bit magnitude comparator
  '74181',   // 4 bit ALU (the classic CPU-design chip)
  '74374',   // octal D flip-flop
  '74245',   // octal bidirectional bus transceiver
  '74573',   // octal D-type latch
  '74244',   // octal buffer/line driver
  '74165',   // 8 bit parallel-in/serial-out shift register
  '74175',   // quad D flip-flop with common clear
  '74174',   // hex D flip-flop with common clear
  '74173',   // 4 bit D-type register with tri-state
  '7476',    // dual JK flip-flop
  '74112',   // dual JK flip-flop with preset/clear
  '7410',    // triple 3-input NAND
  '7420',    // dual 4-input NAND
  '7430',    // 8-input NAND
  '7448',    // BCD-to-7-segment decoder (active high)
  '7406',    // hex inverter, open-collector
  '7407',    // hex buffer, open-collector
  '74125',   // quad bus buffer, tri-state (enable LOW)
  '74126',   // quad bus buffer, tri-state (enable HIGH)
  '74139',   // dual 2-to-4 decoder
  '74153',   // dual 4-to-1 multiplexer
  '74154',   // 4-to-16 decoder
  '74164',   // 8 bit serial-in/parallel-out shift register
  '74194',   // 4 bit bidirectional universal shift register
  '74373',   // octal D-type latch
  '74240',   // octal inverting buffer/line driver
  '74190',   // BCD up/down counter
  '74191',   // 4 bit binary up/down counter
  '7421',    // dual 4-input AND
  '7411',    // triple 3-input AND
  '7427',    // triple 3-input NOR
  '556',     // dual 555 timer
  'CD4017',  // Johnson decade counter (hobbyist favourite)
  'CD4011',  // quad 2-input NAND (CMOS)
  'CD4013',  // dual D flip-flop (CMOS)
  'CD4069',  // hex inverter (CMOS)
  'CD4093',  // quad 2-input Schmitt NAND (CMOS)
  'CD4060',  // 14-stage binary counter with on-chip oscillator
  'CD4511',  // BCD-to-7-segment latch/decoder/driver (CMOS)
  'CD4001',  // quad 2-input NOR (CMOS)
  'CD4081',  // quad 2-input AND (CMOS)
  'CD40106', // hex Schmitt-trigger inverter (CMOS)
];
const _POPULARITY_INDEX = new Map(CHIP_POPULARITY_RANK.map((id, i) => [id, i]));
function _popularityRank(id) {
  const r = _POPULARITY_INDEX.get(id);
  return r === undefined ? Infinity : r;
}

// Search and sort chips.
// options.sortByNumber: true = sort by chip number,
//                       false = sort by static popularity (default false)
export function searchChips(query, { sortByNumber = false } = {}) {
  let q = (query || '').toLowerCase().trim();
  // Normalize 74xx## variants (e.g. 74ls00, 74hc00) → 74x## (e.g. 74x00)
  if (q) q = q.replace(/^74[a-wyz][a-z]*(\d)/, '74x$1');

  const allIds = getAllChipIds();

  function secondarySort(a, b) {
    if (sortByNumber) return _chipNumber(a) - _chipNumber(b);
    const ra = _popularityRank(a);
    const rb = _popularityRank(b);
    if (ra !== rb) return ra - rb;
    // Unranked chips fall back to chip-number order so they stay stable.
    return _chipNumber(a) - _chipNumber(b);
  }

  if (!q) {
    return [...allIds].sort(secondarySort);
  }

  const scored = [];
  for (const id of allIds) {
    const chip = CHIP_DB[id];

    // Tier 1a ID, name (score 0 4): canonical chip identity takes highest priority
    const t1a = Math.min(
      _fuzzyScore(id, q),
      _fuzzyScore(chip.name, q),
    );
    if (t1a < Infinity) { scored.push({ id, score: t1a }); continue; }

    // Tier 1b simpleName, tags (score 5 9): still above description but below name
    const t1b = Math.min(
      _fuzzyScore(chip.simpleName, q),
      ...(chip.tags ? chip.tags.map(t => _fuzzyScore(t, q)) : [Infinity]),
    );
    if (t1b < Infinity) { scored.push({ id, score: 5 + t1b }); continue; }

    // Tier 2 description (score 10 14)
    const t2 = _fuzzyScore(chip.description, q);
    if (t2 < Infinity) { scored.push({ id, score: 10 + t2 }); continue; }

    // Tier 3 chip docs / guideOverview (score 20 24)
    const t3 = _fuzzyScore(chip.guideOverview, q);
    if (t3 < Infinity) { scored.push({ id, score: 20 + t3 }); }
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return secondarySort(a.id, b.id);
  });

  return scored.map(s => s.id);
}

export function getChipPinCount(chipId) {
  const def = CHIP_DB[chipId];
  return def ? def.pins : 0;
}

// Get pin index → breadboard column offset mapping for a DIP chip
// DIP packages: pins 1..N/2 on one side, N/2+1..N on the other
// The chip occupies N/2 columns
export function getChipColSpan(chipId) {
  const def = CHIP_DB[chipId];
  return def ? def.pins / 2 : 0;
}

// BCD to 7-segment truth table (active low outputs for common anode)
// Input: 4 bit BCD (D,C,B,A) → Output: segments a-g (0=on for common anode)
export const BCD_7SEG_TABLE = [
  // DCBA : a b c d e f g
  [0,0,0,0, 0,0,0,0,0,0,1], // 0
  [0,0,0,1, 1,0,0,1,1,1,1], // 1
  [0,0,1,0, 0,0,1,0,0,1,0], // 2
  [0,0,1,1, 0,0,0,0,1,1,0], // 3
  [0,1,0,0, 1,0,0,1,1,0,0], // 4
  [0,1,0,1, 0,1,0,0,1,0,0], // 5
  [0,1,1,0, 0,1,0,0,0,0,0], // 6
  [0,1,1,1, 0,0,0,1,1,1,1], // 7
  [1,0,0,0, 0,0,0,0,0,0,0], // 8
  [1,0,0,1, 0,0,0,0,1,0,0], // 9
];

// BCD to 7-segment truth table (active high outputs for common cathode)
// Input: 4 bit BCD (D,C,B,A) → Output: segments a-g (1=on for common cathode)
export const BCD_7SEG_CC_TABLE = BCD_7SEG_TABLE.map(row => [
  row[0], row[1], row[2], row[3],
  ...row.slice(4).map(bit => (bit ? 0 : 1)),
]);

export { CHIP_DB };

/*All chips implemented:

//block1
7400, 7401, 7402, 7403, 7404, 7405, 7406, 7407, 7408, 7409,
7410, 7411, 7412, 7413, 7414

//block2
7415, 7416, 7417, 7420, 7421, 7422, 7425, 7427, 7430, 7432, 
7437, 7438, 7440, 7442, 7445,

//block3
7446, 7447, 7448, 7451, 7454, 7470, 7472, 7473, 7474, 7475,
7476, 7483, 7485, 7486, 7489, 

//block4
7490, 7491, 7492, 7493, 7495, 74107, 74109, 74121, 74123, 74125, 
74126, 74132, 74138, 74139,

//block5
74148, 74150, 74151, 74153, 74154, 74157, 74160, 74161, 74163,
74164, 74165, 74173, 74174, 

//block6
74175, 74191, 74193, 74240, 74244,74245, 74257, 74259, 74266, 
74273, 74373, 74374, 74541, 74573, 74574, 74595

//block67
555

//block68
CD4001, CD4030, CD4070, CD4071, CD4077, CD4081, CD4093,
CD4023, CD4025, CD4073, CD4075, CD4049, CD4050, CD40106,
CD4013, CD4008, CD4014, CD4015, CD4016, CD4017, CD4060,
CD4510, CD4511, 74x78, 74x31, 74x122, 74x221
*/
