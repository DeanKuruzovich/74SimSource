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
import { CHIPS_BLOCK_70 } from './chips/chips70.js';
import { CHIPS_BLOCK_71 } from './chips/chips71.js';
import { CHIPS_BLOCK_72 } from './chips/chips72.js';
import { CHIPS_BLOCK_73 } from './chips/chips73.js';
import { CHIPS_BLOCK_74 } from './chips/chips74.js';
import { CHIPS_BLOCK_75 } from './chips/chips75.js';
import { CHIPS_BLOCK_76 } from './chips/chips76.js';
import { CHIPS_BLOCK_77 } from './chips/chips77.js';
import { CHIPS_BLOCK_78 } from './chips/chips78.js';
import { CHIPS_BLOCK_79 } from './chips/chips79.js';
import { CHIPS_BLOCK_80 } from './chips/chips80.js';
import { CHIPS_BLOCK_81 } from './chips/chips81.js';
import { CHIPS_BLOCK_82 } from './chips/chips82.js';
import { CHIPS_BLOCK_83 } from './chips/chips83.js';
import { CHIPS_BLOCK_84 } from './chips/chips84.js';
import { CHIPS_BLOCK_85 } from './chips/chips85.js';
import { CHIPS_BLOCK_86 } from './chips/chips86.js';
import { CHIPS_BLOCK_87 } from './chips/chips87.js';
import { CHIPS_BLOCK_88 } from './chips/chips88.js';
import { CHIPS_BLOCK_89 } from './chips/chips89.js';
import { CHIPS_BLOCK_90 } from './chips/chips90.js';
import { CHIPS_BLOCK_91 } from './chips/chips91.js';
import { CHIPS_BLOCK_92 } from './chips/chips92.js';
import { CHIPS_BLOCK_93 } from './chips/chips93.js';
import { CHIPS_BLOCK_94 } from './chips/chips94.js';
import { CHIPS_BLOCK_98 } from './chips/chips98.js';
import { CHIPS_BLOCK_97 } from './chips/chips97.js';
import { CHIPS_BLOCK_96 } from './chips/chips96.js';
import { CHIPS_BLOCK_95 } from './chips/chips95.js';
import { CHIPS_BLOCK_99 } from './chips/chips99.js';
import { CHIPS_BLOCK_100 } from './chips/chips100.js';
import { CHIPS_BLOCK_101 } from './chips/chips101.js';
import { CHIPS_BLOCK_102 } from './chips/chips102.js';
import { CHIPS_BLOCK_103 } from './chips/chips103.js';
import { CHIPS_BLOCK_104 } from './chips/chips104.js';
import { CHIPS_BLOCK_105 } from './chips/chips105.js';
import { CHIPS_BLOCK_106 } from './chips/chips106.js';
import { CHIPS_BLOCK_107 } from './chips/chips107.js';
import { CHIPS_BLOCK_109 } from './chips/chips109.js';
import { CHIPS_BLOCK_108 } from './chips/chips108.js';
import { CHIPS_BLOCK_111 } from './chips/chips111.js';
import { CHIPS_BLOCK_112 } from './chips/chips112.js';
import { CHIPS_BLOCK_113 } from './chips/chips113.js';
import { CHIPS_BLOCK_110 } from './chips/chips110.js';
import { CHIPS_BLOCK_117 } from './chips/chips117.js';
import { CHIPS_BLOCK_114 } from './chips/chips114.js';
import { CHIPS_BLOCK_115 } from './chips/chips115.js';
import { CHIPS_BLOCK_116 } from './chips/chips116.js';
import { CHIPS_BLOCK_118 } from './chips/chips118.js';
import { CHIPS_BLOCK_120 } from './chips/chips120.js';
import { CHIPS_BLOCK_121 } from './chips/chips121.js';
import { CHIPS_BLOCK_119 } from './chips/chips119.js';
import { CHIPS_BLOCK_123 } from './chips/chips123.js';
import { CHIPS_BLOCK_124 } from './chips/chips124.js';
import { CHIPS_BLOCK_125 } from './chips/chips125.js';
import { CHIPS_BLOCK_126 } from './chips/chips126.js';
import { CHIPS_BLOCK_127 } from './chips/chips127.js';
import { CHIPS_BLOCK_122 } from './chips/chips122.js';
import { CHIPS_BLOCK_128 } from './chips/chips128.js';
import { CHIPS_BLOCK_130 } from './chips/chips130.js';
import { CHIPS_BLOCK_129 } from './chips/chips129.js';
import { CHIPS_BLOCK_131 } from './chips/chips131.js';
import { CHIPS_BLOCK_132 } from './chips/chips132.js';
import { CHIPS_BLOCK_134 } from './chips/chips134.js';
import { CHIPS_BLOCK_135 } from './chips/chips135.js';
import { CHIPS_BLOCK_136 } from './chips/chips136.js';
import { CHIPS_BLOCK_137 } from './chips/chips137.js';
import { CHIPS_BLOCK_138 } from './chips/chips138.js';
import { CHIPS_BLOCK_139 } from './chips/chips139.js';
import { CHIPS_BLOCK_133 } from './chips/chips133.js';
import { CHIPS_BLOCK_144 } from './chips/chips144.js';
import { CHIPS_BLOCK_140 } from './chips/chips140.js';
import { CHIPS_BLOCK_141 } from './chips/chips141.js';
import { CHIPS_BLOCK_142 } from './chips/chips142.js';
import { CHIPS_BLOCK_143 } from './chips/chips143.js';
import { CHIPS_BLOCK_145 } from './chips/chips145.js';
import { CHIPS_BLOCK_147 } from './chips/chips147.js';
import { CHIPS_BLOCK_148 } from './chips/chips148.js';
import { CHIPS_BLOCK_146 } from './chips/chips146.js';
import { CHIPS_BLOCK_153 } from './chips/chips153.js';
import { CHIPS_BLOCK_151 } from './chips/chips151.js';
import { CHIPS_BLOCK_155 } from './chips/chips155.js';
import { CHIPS_BLOCK_157 } from './chips/chips157.js';
import { CHIPS_BLOCK_164 } from './chips/chips164.js';
import { CHIPS_BLOCK_167 } from './chips/chips167.js';
import { CHIPS_BLOCK_168 } from './chips/chips168.js';
import { CHIPS_BLOCK_169 } from './chips/chips169.js';
import { CHIPS_BLOCK_165 } from './chips/chips165.js';
import { CHIPS_BLOCK_159 } from './chips/chips159.js';
import { CHIPS_BLOCK_162 } from './chips/chips162.js';
import { CHIPS_BLOCK_166 } from './chips/chips166.js';
import { CHIPS_BLOCK_160 } from './chips/chips160.js';
import { CHIPS_BLOCK_161 } from './chips/chips161.js';
import { CHIPS_BLOCK_170 } from './chips/chips170.js';

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
  ...CHIPS_BLOCK_70,
  ...CHIPS_BLOCK_71,
  ...CHIPS_BLOCK_72,
  ...CHIPS_BLOCK_73,
  ...CHIPS_BLOCK_74,
  ...CHIPS_BLOCK_75,
  ...CHIPS_BLOCK_76,
  ...CHIPS_BLOCK_77,
  ...CHIPS_BLOCK_78,
  ...CHIPS_BLOCK_79,
  ...CHIPS_BLOCK_80,
  ...CHIPS_BLOCK_81,
  ...CHIPS_BLOCK_82,
  ...CHIPS_BLOCK_83,
  ...CHIPS_BLOCK_84,
  ...CHIPS_BLOCK_85,
  ...CHIPS_BLOCK_86,
  ...CHIPS_BLOCK_87,
  ...CHIPS_BLOCK_88,
  ...CHIPS_BLOCK_89,
  ...CHIPS_BLOCK_90,
  ...CHIPS_BLOCK_91,
  ...CHIPS_BLOCK_92,
  ...CHIPS_BLOCK_93,
  ...CHIPS_BLOCK_94,
  ...CHIPS_BLOCK_96,
  ...CHIPS_BLOCK_98,
  ...CHIPS_BLOCK_97,
  ...CHIPS_BLOCK_95,
  ...CHIPS_BLOCK_99,
  ...CHIPS_BLOCK_100,
  ...CHIPS_BLOCK_101,
  ...CHIPS_BLOCK_102,
  ...CHIPS_BLOCK_103,
  ...CHIPS_BLOCK_104,
  ...CHIPS_BLOCK_105,
  ...CHIPS_BLOCK_106,
  ...CHIPS_BLOCK_107,
  ...CHIPS_BLOCK_109,
  ...CHIPS_BLOCK_108,
  ...CHIPS_BLOCK_111,
  ...CHIPS_BLOCK_112,
  ...CHIPS_BLOCK_113,
  ...CHIPS_BLOCK_110,
  ...CHIPS_BLOCK_117,
  ...CHIPS_BLOCK_114,
  ...CHIPS_BLOCK_115,
  ...CHIPS_BLOCK_116,
  ...CHIPS_BLOCK_118,
  ...CHIPS_BLOCK_120,
  ...CHIPS_BLOCK_121,
  ...CHIPS_BLOCK_119,
  ...CHIPS_BLOCK_123,
  ...CHIPS_BLOCK_124,
  ...CHIPS_BLOCK_125,
  ...CHIPS_BLOCK_126,
  ...CHIPS_BLOCK_127,
  ...CHIPS_BLOCK_122,
  ...CHIPS_BLOCK_128,
  ...CHIPS_BLOCK_130,
  ...CHIPS_BLOCK_129,
  ...CHIPS_BLOCK_131,
  ...CHIPS_BLOCK_132,
  ...CHIPS_BLOCK_134,
  ...CHIPS_BLOCK_135,
  ...CHIPS_BLOCK_136,
  ...CHIPS_BLOCK_137,
  ...CHIPS_BLOCK_138,
  ...CHIPS_BLOCK_139,
  ...CHIPS_BLOCK_133,
  ...CHIPS_BLOCK_144,
  ...CHIPS_BLOCK_140,
  ...CHIPS_BLOCK_141,
  ...CHIPS_BLOCK_142,
  ...CHIPS_BLOCK_143,
  ...CHIPS_BLOCK_145,
  ...CHIPS_BLOCK_147,
  ...CHIPS_BLOCK_148,
  ...CHIPS_BLOCK_146,
  ...CHIPS_BLOCK_153,
  ...CHIPS_BLOCK_155,
  ...CHIPS_BLOCK_157,
  ...CHIPS_BLOCK_164,
  ...CHIPS_BLOCK_151,
  ...CHIPS_BLOCK_167,
  ...CHIPS_BLOCK_168,
  ...CHIPS_BLOCK_169,
  ...CHIPS_BLOCK_165,
  ...CHIPS_BLOCK_159,
  ...CHIPS_BLOCK_162,
  ...CHIPS_BLOCK_166,
  ...CHIPS_BLOCK_160,
  ...CHIPS_BLOCK_161,
  ...CHIPS_BLOCK_170,
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
// usage of 74 series TTL, 4000 series CMOS, and 555-family timer chips.
export const CHIP_POPULARITY_RANK = [
  '555',     // 555 timer   the most-used IC in history
  '74x00',    // quad 2-input NAND   the canonical TTL chip
  '74x04',    // hex inverter
  '74x08',    // quad 2-input AND
  '74x02',    // quad 2-input NOR
  '74x32',    // quad 2-input OR
  '74x86',    // quad 2-input XOR
  '74x595',   // 8 bit serial in/parallel out shift register (maker favourite)
  '74x74',    // dual D flip flop
  '74x14',    // hex Schmitt trigger inverter
  '74x161',   // 4 bit synchronous binary counter (async clear)
  '74x163',   // 4 bit synchronous binary counter (sync clear)
  '74x138',   // 3 to 8 line decoder
  '74x157',   // quad 2-to-1 multiplexer
  '74x151',   // 8-to-1 multiplexer
  '74x148',   // 8 to 3 priority encoder
  '74x47',    // BCD to-7 segment decoder/driver
  '74x90',    // decade counter (classic teaching chip)
  '74x93',    // 4 bit binary counter
  '74x193',   // 4 bit synchronous up/down counter
  '74x283',   // 4 bit binary full adder with fast carry
  '74x83',    // 4 bit binary full adder
  '74x85',    // 4 bit magnitude comparator
  '74x181',   // 4 bit ALU (the classic CPU-design chip)
  '74x374',   // octal D flip flop
  '74x245',   // octal bidirectional bus transceiver
  '74x573',   // octal D type latch
  '74x244',   // octal buffer/line driver
  '74x165',   // 8 bit parallel in/serial out shift register
  '74x175',   // quad D flip flop with common clear
  '74x174',   // hex D flip flop with common clear
  '74x173',   // 4 bit D type register with tri state
  '74x76',    // dual JK flip flop
  '74x112',   // dual JK flip flop with preset/clear
  '74x10',    // triple 3-input NAND
  '74x20',    // dual 4-input NAND
  '74x30',    // 8-input NAND
  '74x48',    // BCD to-7 segment decoder (active high)
  '74x06',    // hex inverter, open collector
  '74x07',    // hex buffer, open collector
  '74x125',   // quad bus buffer, tri state (enable LOW)
  '74x126',   // quad bus buffer, tri state (enable HIGH)
  '74x139',   // dual 2-to-4 decoder
  '74x153',   // dual 4-to-1 multiplexer
  '74x154',   // 4-to-16 decoder
  '74x164',   // 8 bit serial in/parallel out shift register
  '74x194',   // 4 bit bidirectional universal shift register
  '74x373',   // octal D type latch
  '74x240',   // octal inverting buffer/line driver
  '74x190',   // BCD up/down counter
  '74x191',   // 4 bit binary up/down counter
  '74x21',    // dual 4-input AND
  '74x11',    // triple 3-input AND
  '74x27',    // triple 3-input NOR
  '556',     // dual 555 timer
  'CD4017',  // Johnson decade counter (hobbyist favourite)
  'CD4011',  // quad 2-input NAND (CMOS)
  'CD4013',  // dual D flip flop (CMOS)
  'CD4069',  // hex inverter (CMOS)
  'CD4093',  // quad 2-input Schmitt NAND (CMOS)
  'CD4060',  // 14-stage binary counter with on-chip oscillator
  'CD4511',  // BCD to-7 segment latch/decoder/driver (CMOS)
  'CD4001',  // quad 2-input NOR (CMOS)
  'CD4081',  // quad 2-input AND (CMOS)
  'CD40106', // hex Schmitt trigger inverter (CMOS)
  '28C16',   // 2K × 8 EEPROM (AT28C16)
  'LM741',   // the classic op-amp
  'LM393',   // dual comparator (analog → digital bridge)
  'ULN2003', // 7-channel Darlington driver (relays/steppers)
  'LM7805',  // +5 V linear regulator
  '2764',    // 8K × 8 UV EPROM (homebrew-computer ROM)
];
const _POPULARITY_INDEX = new Map(CHIP_POPULARITY_RANK.map((id, i) => [id, i]));
function _popularityRank(id) {
  const r = _POPULARITY_INDEX.get(id);
  return r === undefined ? Infinity : r;
}

// Search and sort chips.
// options.sortByNumber: true = sort by chip number,
//                       false = sort by static popularity (default false)
// options.includeStubs:  true = include chips tagged 'stub' (info sheet only,
//                              no functional simulation),
//                       false = exclude them (default false — the in-app picker
//                              should not surface unimplemented parts; the docs
//                              page opts in so users can still browse them).
export function searchChips(query, { sortByNumber = false, includeStubs = false } = {}) {
  let q = (query || '').toLowerCase().trim();
  // Normalize 74xx## variants (e.g. 74ls00, 74hc00) → 74x## (e.g. 74x00)
  if (q) q = q.replace(/^74[a-wyz][a-z]*(\d)/, '74x$1');

  const allIds = (includeStubs
    ? getAllChipIds()
    : getAllChipIds().filter(id => !(CHIP_DB[id]?.tags?.includes('stub'))))
    .filter(id => !CHIP_DB[id]?.hidden);

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

// BCD to 7 segment truth table (active low outputs for common anode)
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

// BCD to 7 segment truth table (active high outputs for common cathode)
// Input: 4 bit BCD (D,C,B,A) → Output: segments a-g (1=on for common cathode)
export const BCD_7SEG_CC_TABLE = BCD_7SEG_TABLE.map(row => [
  row[0], row[1], row[2], row[3],
  ...row.slice(4).map(bit => (bit ? 0 : 1)),
]);

// BCD to 7 segment table for the 7446/7447/7448 glyph font (active high, common
// cathode). Same as BCD_7SEG_CC_TABLE except 6 is drawn TAIL-LESS (top bar a off)
// and 9 is drawn TAIL-LESS (bottom bar d off). This matches TI SDLS111: the
// SN7448 draws 6 and 9 without those bars, while the '247/'248 (which use the
// generic table above) draw them "with tails". Row layout: [D,C,B,A, a,b,c,d,e,f,g],
// so segment a is index 4 and segment d is index 7. Only 74x48 uses this today;
// the '46/'47 siblings still share the tailed table — see issues.md C108.
export const BCD_7SEG_CC_7448_TABLE = BCD_7SEG_CC_TABLE.map(row => {
  const r = row.slice();
  const bcd = (r[0] << 3) | (r[1] << 2) | (r[2] << 1) | r[3];
  if (bcd === 6) r[4] = 0; // segment a off → tail-less 6
  if (bcd === 9) r[7] = 0; // segment d off → tail-less 9
  return r;
});

// BCD to 7 segment table for the 7446/7447 glyph font (active LOW, common
// anode). Same as BCD_7SEG_TABLE except 6 is drawn TAIL-LESS (top bar a off)
// and 9 is drawn TAIL-LESS (bottom bar d off), per TI SDLS111 FUNCTION TABLE T1.
// This is the common-anode twin of BCD_7SEG_CC_7448_TABLE above: the '246/'247
// (which use the generic tailed table) draw 6 and 9 "with tails", the '46/'47 do
// not. Row layout: [D,C,B,A, a,b,c,d,e,f,g], active LOW so 1 = segment OFF;
// segment a is index 4 and segment d is index 7. Only 74x47 uses this today; the
// '46 sibling still shares the tailed table — see issues.md C108/C115.
export const BCD_7SEG_7447_TABLE = BCD_7SEG_TABLE.map(row => {
  const r = row.slice();
  const bcd = (r[0] << 3) | (r[1] << 2) | (r[2] << 1) | r[3];
  if (bcd === 6) r[4] = 1; // segment a OFF (active low) → tail-less 6
  if (bcd === 9) r[7] = 1; // segment d OFF (active low) → tail-less 9
  return r;
});

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

//block71
LM741, LM393, ULN2003, LM7805, 2764, XO (crystal oscillator)

//block72  (CMOS 4000 coverage expansion, Batch 1 — combinational gates)
CD4000, CD4002, CD4009, CD4010, CD4041, CD4068, CD4072, CD4078, CD4572, CD4584

//block73  (CMOS 4000 coverage expansion, Batch 12 — timers / monostables)
CD4538

//block74  (CMOS 4000 coverage expansion, Batch 2 — primitive-backed combinational)
CD4063, CD4585

//block78  (CMOS 4000 coverage expansion, Batch 12 — monostable / astable multivibrator)
CD4047

//block81  (CMOS 4000 coverage expansion, Batch 11 — analog mux/demux)
CD4067

//block80  (CMOS 4000 coverage expansion, Batch 11 — analog switch)
CD4066

//block83  (CMOS 4000 coverage expansion, Batch 5 — ripple counter)
CD4040

//block84  (CMOS 4000 coverage expansion, Batch 5 — ripple counter)
CD4024

//block85  (CMOS 4000 coverage expansion, Batch 6 — presettable up/down bin/BCD counter)
CD4029

//block86  (CMOS 4000 coverage expansion, Batch 6 — octal Johnson counter, decoded)
CD4022

//block89  (CMOS 4000 coverage expansion, Batch 9 — 8-stage PISO shift register, async load)
CD4021

//block90  (CMOS 4000 coverage expansion, Batch 10 — BCD-to-decimal / binary-to-octal decoder, active-HIGH)
CD4028

//block88  (CMOS 4000 coverage expansion, Batch 9 — 8-stage shift-and-store bus register)
CD4094

//block91  (CMOS 4000 coverage expansion, Batch 4 — quad clocked "D" latch, complementary outputs)
CD4042
//block111  (CMOS 4000 coverage expansion, Batch 4 — quad 3-state NOR R/S latch)
CD4043
//block112  (CMOS 4000 coverage expansion, Batch 4 — quad 3-state NAND R/S latch)
CD4044
//block113  (CMOS 4000 coverage expansion, Batch 4 — 4-bit D register, 3-state outputs, async reset)
CD4076

//block92  (CMOS 4000 coverage expansion, Batch 4 — hex D flip-flop, common clock + common async clear)
CD40174

//block93  (CMOS 4000 coverage expansion, Batch 4 — quad D flip-flop, common clock + common async clear, Q & Q-bar)
CD40175

//block94  (CMOS 4000 coverage expansion, Batch 8 — decade counter + decoded 7-seg driver, display enable)
CD4026

//block96  (CMOS 4000 coverage expansion, Batch 12 — PLL with VCO; documentation stub, PLL not modeled)
CD4046

//block95  (CMOS 4000 coverage expansion, Batch 8 — decade counter + decoded 7-seg driver, ripple blanking + lamp test)
CD4033

//block103 (CMOS 4000 coverage expansion, Batch 2 — expandable 4-wide 2-input AND-OR-INVERT gate, inhibit/enable expand)
CD4086

//block102 (CMOS 4000 coverage expansion, Batch 2 — dual 2-wide 2-input AND-OR-INVERT gate, per-gate inhibit)
CD4085

//block101  (CMOS 4000 coverage expansion, Batch 2 — quad AND/OR select gate, shared Ka/Kb selects)
CD4019

//block104  (CMOS 4000 coverage expansion, Batch 2 — triple AND/OR bi-phase pairs, AOI with shared A/B controls)
CD4037

//block106  (CMOS 4000 coverage expansion, Batch 2 — 13-input parity checker / 12-bit parity tree, built-in multi-input XOR)
CD4531

//block109  (CMOS 4000 coverage expansion, Batch 3 — dual 2-input NAND buffer/driver, open-drain outputs)
CD40107

//block108  (CMOS 4000 coverage expansion, Batch 3 — hex non-inverting 3-state buffer, split active-HIGH disables 4+2, BUFFER_HEX_TRI splitDisable)
CD4503

//block110  (CMOS 4000 coverage expansion, Batch 3 — quad low-to-high voltage level shifter, individual active-HIGH enables, 3-state, BUFFER_QUAD_TRI_NHIGH)
CD40109

//block115  (CMOS 4000 coverage expansion, Batch 4 — gated J-K master/slave FF, inverting + non-inverting J/K inputs, active-HIGH SET/RESET, JK_FF preClrActiveHigh)
CD4096

//block123  (CMOS 4000 coverage expansion, Batch 7 — synchronous decade counter, asynchronous clear, COUNTER_SYNC_DECADE)
CD40160

//block124  (CMOS 4000 coverage expansion, Batch 13 — synchronous 4-bit binary counter, asynchronous clear, COUNTER_SYNC_BIN)
CD40161

//block122  (CMOS 4000 coverage expansion — programmable BCD divide-by-N down counter, decoded-zero output, cascade feedback, BCD_DIVN_DOWN_4522)
CD4522

//block127  (CMOS 4000 coverage expansion, Batch 6 — presettable BCD up/down counter, DUAL clock; reuses COUNTER_DECADE_DC, the 74x192 model — hinted COUNTER_BCD_UPDOWN_CD/CD4510 is single-clock and did not fit)
CD40192

//block128  (CMOS 4000 coverage expansion, Batch 7 — presettable BINARY up/down counter, DUAL clock; reuses COUNTER_UPDOWN_DC, the 74x193 model — hinted COUNTER_BIN_UPDOWN_CD/CD4516 is single-clock and did not fit)
CD40193

//block142  (CMOS 4000 coverage expansion — differential/dual 8-channel analog mux/demux, two 8:1 banks sharing one 3-bit address A/B/C + INHIBIT; new ANALOG_MUX_DUAL8 primitive (8-channel sibling of ANALOG_MUX_DUAL4); pinout read off the CD4097 logic diagram in TI SCHS052D, not cloned from the CD4067 — INHIBIT on 13, no D bit)
CD4097

//block118  (CMOS 4000 coverage expansion — dual 4-bit transparent latch, 3-state outputs, per-latch active-HIGH STROBE/RESET/OUTPUT DISABLE; new LATCH_4BIT_TRI_RST primitive — hinted LATCH_TRANS_4BIT is the 74226 transceiver and D_LATCH is single-bit, neither fit)
CD4508

//block136  (CMOS 4000 coverage expansion — 8-channel data selector / 8-to-1 mux, single non-inverting 3-state output, separate active-HIGH INHIBIT (drives 0) and 3-STATE DISABLE (Hi-Z); new MUX_8TO1_TRI_INH primitive — hinted MUX_8TO1_TRI is the 74251 with complementary Y/W outputs + single enable, did not fit)
CD4512

//block131  (CMOS 4000 coverage expansion, Batch 8 — dual-clocked decade up/down counter + output latch + 7-seg decoder/driver + CARRY/BORROW; new COUNTER_7SEG_40110 primitive — hinted COUNTER_7SEG/COUNTER_DEC_NIXIE are single-clock BCD/1-of-10 parts and did not fit)
CD40110

//block134  (CMOS 4000 coverage expansion, Batch 9 — 4-bit bidirectional UNIVERSAL shift register, three-state outputs; new SHIFT_REG_4BIT_UNIV_TRI primitive — hinted SHIFT_REG_4BIT_BIDIR_TRI is the 74295 single-direction model and did not fit; mode 00 = synchronous clear)
CD40104

//block139  (CMOS 4000 coverage expansion, Batch 10 — quad 2-line-to-1-line data selector/mux, non-inverting, shared INPUT SELECT + active-HIGH OUTPUT DISABLE (Hi-Z); reuses MUX_2TO1_TRI ×4 — the clocked-storage sibling MUX_QUAD_2TO1_STORED is the 74298 and did not fit; pinout verified vs TI CD40257B SCHS108C, not cloned from the 74x257)
CD40257

//block145  (CMOS 4000 coverage expansion — triple serial adder, negative-edge clock; new SERIAL_ADDER_TRIPLE_4038 primitive, sibling of the rising-edge CD4032; hinted SERIAL_ADDER_QUAD is the 74385 quad subtract-by-inverting-B model and did not fit; pinout verified vs SGS-Thomson HCC/HCF4038B, not cloned)
CD4038

//block143  (CMOS 4000 coverage expansion, Batch 12 — programmable timer: 24-stage ripple counter with a 1-of-16 BCD-selectable output tap + 8-stage bypass; new FREQ_DIV_PROG_4536 primitive — hinted FREQ_DIV_PROG is the 74292 single-toggling-OUT part and did not fit; RC oscillator + variable monostable not simulated, modeled as the externally-clocked divider with MONO IN grounded)
CD4536

//block146  (CMOS 4000 coverage expansion — CD4057A RCA COS/MOS LSI 4-bit ALU / bit-slice processor; documentation stub, GENERIC_STUB, tags ['stub']. The hinted ALU_4BIT is the COMBINATIONAL 74181/CD40181 and does NOT fit: the CD4057A is a CLOCKED accumulator-style processor — internal 4-bit result register, 16-instruction repertoire (a/b/c/d opcode), 4 serial-cascade modes (C1/C2), bidirectional left/right serial lines, overflow flip-flop, conditional clock gating. Info sheet only. Pinout verified vs RCA File No. 635 (1975) Fig. 2 terminal assignment, read as 300-dpi PDF page images, not cloned. See issues.md C14.)
CD4057

//block153  (CMOS 4000 coverage expansion, Batch 3 — CD40117 programmable dual 4-bit bus terminator; documentation stub, GENERIC_STUB, tags ['stub']. Each of two sections becomes weak pull-up resistors, weak pull-down resistors, or a bus-hold latch, per its STROBE+DATA bits. 74Sim does not model weak-keeper / weak-resistor drive strength (issues.md A12), so it ships info-sheet-only per Coverage-Plan §D3. Pinout + truth table verified vs TI/Harris CD40117B SCHS101C, read as PDF page images, not cloned.)
CD40117

//block157  (CMOS 4000 coverage expansion, Batch 9 — CD4517B dual 64-stage static shift register; documentation stub, SHIFT_REG_16BIT_STUB, tags ['stub']. The four taps per register (after stages 16/32/48/64) are bidirectional three-state pins: outputs when WRITE ENABLE is LOW, inputs that block-load stages 17/33/49 when WRITE ENABLE is HIGH on the rising clock edge. No engine shift-register primitive models a tap that flips direction at run time or the mid-chain block load, so it ships info-sheet-only per issues.md B2 (same family as 74673/674/675/676). Pinout verified vs TI/Harris CD4517B SCHS075 terminal assignment + block diagram, read as 300-dpi PDF page images, not cloned.)
CD4517

//block151  (CMOS 4000 coverage expansion, Batch 2 — CD4048 multifunction expandable 8-input gate with 3-state output; documentation stub, GENERIC_STUB, tags ['stub']. Ka/Kb/Kc select 1 of 8 functions (NOR/OR/OR-AND/OR-NAND/AND/NAND/AND-NOR/AND-OR), Kd is a 3-state control, EXPAND cascades two packages to 16 inputs. 74Sim has no function-select gate primitive (Coverage-Plan Batch 2 marks it 🔴 too complex), so info-sheet-only. Pinout + function table verified vs TI CD4048B SCHS045C, read as PDF page images, not cloned — issues.md C2/C4.)
CD4048

//block155  (CMOS 4000 coverage expansion — CD4006 18-stage static shift register; four independent sections 4+5+4+5 stages on a common clock, FALLING-edge shift, plus the half-cycle-delayed D1+4' cascade output. New SHIFT_REG_18BIT_4006 primitive — the hinted SHIFT_REG_SISO is the 7491 (8-stage, A·B data, rising edge) and SHIFT_REG_16BIT_STUB is inert; neither fit. Pinout + functional diagram verified vs the SYC second-source CD4006 datasheet (TI cd4006b.pdf 404s), read as a rendered PDF page image, not cloned.)
CD4006

//block164  (CMOS 4000 coverage expansion, Batch 9 — CD4031 64-stage static SISO shift register; NEW SHIFT_REG_64BIT_4031 primitive — a genuine 64-deep serial register, NOT the inert SHIFT_REG_16BIT_STUB the hint pointed at. Data shifts one of 64 stages per RISING clock edge; MODE CONTROL low = DATA IN 1, high = DATA IN 2 (recirculate); Q (pin 6) and Q-bar (pin 7) are the stage-64 true/complement outputs, Q' (pin 5) is the stage-64 value half a clock later (captured on the FALLING edge), CL_D (pin 9) is a delayed clock for cascading. Only divergence is the engine-wide zero propagation delay (issues.md A1): CL_D follows the clock level and Q' is the exact half-clock-delayed Q. Pinout + behavior verified vs TI/Harris CD4031B SCHS036B (Rev. July 2003), read as 400-dpi PDF page images, not cloned. Replaces the earlier chips156.js stub. Regression: js/debug/scenarios/cd4031-shift-register.mjs)
CD4031

//block166  (CMOS 4000 coverage expansion — CD4062A 200-stage dynamic shift register; documentation stub, GENERIC_STUB, tags ['stub']. A 200-cell serial shift register clocked either single-phase (CM low, clock on CL pin 1) or two-phase (CM high, CL1/CL2 pins 9/5), with a recirculate path (RC/REC pins 3/4) that feeds Q back to the input for use as a long serial memory, and delayed-clock outputs CL1D/CL2D (pins 8/6) for cascading. It is a DYNAMIC register: each bit is stored as charge that leaks away unless clocked continuously above ~10 kHz, so data is lost if the clock stops. 74Sim models storage as ideal/static with no charge decay or minimum clock rate (issues.md A5/A3); 200 stages also exceeds the engine's 31-bit shift-register packing (issues.md D6, same reason the 32/64-stage CD40100/CD4031/CD4517 are stubs); and nothing models the dual clock modes, recirculate gating, or delayed-clock cascade outputs — so it ships info-sheet-only per Coverage-Plan §D3. CD4062A has no DIP; modeled as the 12-lead TO-5 (CD4062AT). Pinout verified vs the RCA CD4062AT TERMINAL DIAGRAM 92CS-22693 (1980 COS/MOS databook p.580) cross-checked against the 1975 File No. 816 logic diagram, read as rendered PDF page images, not cloned — issues.md C2/C4.)
CD4062

//block167  (CMOS 4000 coverage expansion, Batch 15 — CD4054 4-segment liquid-crystal display driver; documentation stub, GENERIC_STUB, tags ['stub']. Four independent channels, each a STROBE-gated transparent latch driving a level-shifted segment output, with one common DISPLAY-FREQUENCY (DF) input: OUT = latched IN XOR DF. An LCD segment is turned on/off by the AC PHASE of OUT relative to the backplane square wave on DF, which 74Sim's DC functional-logic engine and idealized clocks cannot represent (issues.md A3), and there is no loose-LCD-segment widget — so it ships info-sheet-only per Coverage-Plan §D3. Pinout + truth table verified vs TI/Harris CD4054B SCHS048C, read as 300-dpi PDF page images, not cloned from the CD4055B/CD4056B siblings.)
CD4054

//block168  (CMOS 4000 coverage expansion, Batch 15 — CD4055 BCD-to-7-segment LCD decoder/driver with a Display-Frequency output; standalone block for the parallel-agent run. New BCD_7SEG_4055 engine primitive (modeled "BCD_7SEG_4543-style" per the coverage plan, but its own type, not the CD4543's): purely combinational, no input latch and no blanking (those are the CD4056B / CD4543), and it decodes ALL 16 codes — 0-9 plus L,H,P,A,"-",blank — whereas the CD4543 blanks 10-15. The DISPLAY-FREQUENCY (DF) input maps to output polarity exactly like the CD4543 Ph pin: DF=LOW → selected segments HIGH (common cathode), DF=HIGH → outputs inverted (common anode); DFO = buffered DF. The AC, phase-based liquid-crystal drive (square wave on DF, segment on/off by phase across glass) is NOT modeled — DF is a static level (issues.md A3) — but the static decode drives the 7-segment display widget like the CD4543, so it ships as a WORKING chip (unlike the CD4054 stub, which has no decode and no 7-seg widget). Pinout + truth table verified vs TI/Harris CD4055B SCHS048C terminal assignment (92CS-24486) + functional diagram + the CD4055B/CD4056B truth table, read as 300-dpi PDF page images, not cloned from the CD4054B/CD4056B siblings — issues.md C2/C4.)
CD4055

//block169  (CMOS 4000 coverage expansion, Batch 15 — CD4056 BCD-to-7-segment LCD decoder/driver with a STROBED input latch; standalone block for the parallel-agent run. New BCD_7SEG_4056 engine primitive (modeled "BCD_7SEG_4543-style" per the coverage plan, but its own type, not the CD4543's): the sibling of the CD4055 with the same full 16-code decode — 0-9 plus L,H,P,A,"-",blank (the CD4543 blanks 10-15) — but it adds a STROBE latch (STROBE HIGH=transparent/follow, LOW=latched/hold) in place of the CD4055's DISPLAY-FREQ OUT pin, and has no blanking pin. STROBE is the OPPOSITE polarity to the CD4543 LE, so it cannot reuse the CD4543 primitive. The DISPLAY-FREQUENCY (DF) input maps to output polarity exactly like the CD4543 Ph pin: DF=LOW → selected segments HIGH (common cathode), DF=HIGH → outputs inverted (common anode). The AC, phase-based liquid-crystal drive (square wave on DF, segment on/off by phase across glass) is NOT modeled — DF is a static level (issues.md A3) — but the static decode drives the 7-segment display widget like the CD4543, so it ships as a WORKING chip (unlike the CD4054 stub, which has no decode and no 7-seg widget); a deliberate divergence from the issues.md C19 note that had grouped CD4055/CD4056 with the CD4054 stub. Pinout + truth table verified vs TI/Harris CD4056B SCHS048C terminal assignment (92CS-24487) + Fig.3 functional diagram + the CD4055B/CD4056B truth table + the CD4054B ST truth table, read as 300-dpi PDF page images, not cloned from the CD4543/CD4054B/CD4055B siblings — issues.md C2/C4. Behavioral regression: js/debug/scenarios/cd4056-bcd-7seg-lcd.mjs.)
CD4056

//block165  (CMOS 4000 coverage expansion — CD40100B 32-stage static left/right shift register; documentation stub, SHIFT_REG_16BIT_STUB, tags ['stub']. A 32-stage register whose shift DIRECTION (LEFT/RIGHT CONTROL pin 13: 0=right stage1→32, 1=left stage32→1) and RECIRCULATE feedback path (RECIRCULATE CONTROL pin 9: 1=external serial input, 0=far-end feeds back into the entering end) are both chosen at run time, shifting on the positive CLOCK edge with CLOCK INHIBIT (pin 2) HIGH freezing it; SHIFT LEFT OUT (pin 4)=stage1/Q1, SHIFT RIGHT OUT (pin 12)=stage32/Q32 appear half a clock late (next falling edge). No engine primitive models a register that reverses direction and reroutes feedback live, and the shared engine file cannot be edited during this parallel run, so it ships info-sheet-only per issues.md B2 (same family as the 64-stage CD4031/CD4517 stubs). Pinout verified vs the RCA CD40100B terminal assignment (92CS-27568) + functional diagram (92CS-27567) + control truth table in the RCA 1980 COS/MOS databook, read as rendered PDF page images, cross-checked vs the Datasheet Hub pin table, not cloned — issues.md C2/C4.)
CD40100

//block159  (CMOS 4000 coverage expansion — CD4089 4-bit binary rate multiplier; reuses the 74x97 RATE_MULT_6BIT primitive with a new opt-in enableActiveLow flag so OUT = CLOCK AND NOT STROBE (STR=1 blanks OUT per the truth table). Behavioral approximation, issues.md B4: the N/16 pulse-rate division, two-chip cascade, the complementary OUT-bar pin, the "15" detect, and the inhibit/carry chain are not modeled — those pins are informational. Pinout verified vs TI/Harris CD4089B SCHS062B terminal assignment + functional/logic diagrams + truth table, read as rendered PDF page images, not cloned from the TTL 74x97 — issues.md C2/C4.)
CD4089

//block160  (CMOS 4000 coverage expansion — CD4527 BCD/decade rate multiplier; standalone block for the parallel-agent run. New RATE_MULT_BCD_4527 engine primitive: an internal decade counter (0-9) whose ten states are "owned" by the four rate weights (A→{9}, B→{3,7}, C→{1,4,6,8}, D→{1..8}) so OUT delivers exactly N pulses per 10 clock pulses, N = BCD(D,C,B,A); the state masks reproduce the datasheet truth table for ALL 16 codes (valid 0-9 → N; invalid 10-15 → 8/9). CLEAR/SET-TO-"9" async, STROBE/INHIBIT blank OUT, CASCADE forces OUT HIGH, "9" OUT + INHIBIT/CARRY OUT for cascading. The hinted RATE_MULT_DECADE is the 74167 (CLR/LOAD/ENP/ENT, single-pulse Z) and did NOT fit. Behavioral approximation per issues.md B4 — exact intra-cycle pulse phase + two-chip cascade not modeled (A1). Pinout + truth table + logic/timing diagrams verified vs TI/Harris CD4527B SCHS080C, read as rendered PDF page images, not cloned from the binary CD4089 sibling — issues.md C2/C4.)
CD4527

//block170  (CMOS 4000 coverage expansion — CD4007 dual complementary MOS pair plus inverter; documentation stub, GENERIC_STUB, tags ['stub']. A bare transistor array: three n-channel + three p-channel MOSFETs as three complementary pairs, each with the two gates tied to one input pin and the drain/source terminals brought out individually so the user wires it into inverters, a 3-input NAND/NOR, current drivers, transmission gates, or analog linear amplifiers / crystal oscillators. The chip has no fixed function to simulate and its common uses are analog/transistor-level, which 74Sim's gate-level digital engine does not model (issues.md A11/A2/A3) — so it ships info-sheet-only per Coverage-Plan §D3 / chips-to-add hint GENERIC_STUB. Pinout + transistor map verified vs TI/Harris CD4007UB SCHS018C "TERMINAL DIAGRAM Top View" (92CS-24449) + functional diagram, read as a 400-dpi PDF page image cropped/zoomed for the small per-pin labels, not cloned from a sibling — issues.md C2/C4.)
CD4007
*/
