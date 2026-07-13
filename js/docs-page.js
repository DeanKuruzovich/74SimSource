import { CHIP_DB, searchChips } from '/js/chips.js';
import { loadExamples } from '/js/examples.js';
import { t } from '/js/i18n.js';

// ── "Not simulated" detection ────────────────────────────────────────────────
// These gate types are pure stubs in the simulator: their evaluator forces every
// output to high-impedance (or 0) regardless of the inputs, so the chip does
// nothing useful when placed. A chip whose ENTIRE gate list is made of these is
// honestly flagged in its reference page (see buildChipArticleHtml). Keep this set
// in sync with the stub evaluators in js/specificChipsSim.js. NOTE: do not add
// behavioural approximations here (VCO_STUB, CRYSTAL_OSC*, CLK_4PHASE_GEN,
// JTAG_ASP, MEM_CYCLE_CTRL, the serial-adder/BCD-ALU stubs, …) — those do model
// real (if simplified) behaviour and are documented per-chip instead.
const NOT_SIMULATED_GATE_TYPES = new Set([
  'GENERIC_STUB',          // _evaluateGenericStub      → all outputs Hi-Z
  'DRAM_REFRESH_STUB',     // _evaluateDramRefreshStub  → all outputs Hi-Z
  'SHIFT_REG_16BIT_STUB',  // _evaluateShiftReg16BitStub→ all outputs Hi-Z
  'CRC_16BIT',             // _evaluateCrc16Bit         → all outputs 0
  'POLY_CHECKER',          // _evaluatePolyChecker      → all outputs 0
  'INTR_PRIORITY_CTRL',    // _evaluateIntrPriorityCtrl → all outputs 0
  'CLK_GEN_TWOPHASE',      // _evaluateClkGenTwophase   → all outputs Hi-Z
]);

// True when a placeable chip's logic is entirely non-functional stub code.
function chipIsNotSimulated(def) {
  if (!Array.isArray(def.gates) || def.gates.length === 0) return false;
  return def.gates.every(g => NOT_SIMULATED_GATE_TYPES.has(g.type));
}

function escHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Math-style formula rendering ────────────────────────────────────────────
// Turns plain-text formulas like "tHIGH ~= 0.693 * (R1 + R2) * C" into HTML
// with subscripted variables, ≈ for ~=, · for *, and stacked fractions for /.
function _renderInline(expr) {
  let s = escHtml(expr);
  // Subscripts for common timer variables
  s = s.replace(/\bt(HIGH|LOW)\b/g, 't<sub>$1</sub>');
  s = s.replace(/\bR(\d+)\b/g, 'R<sub>$1</sub>');
  s = s.replace(/\bC(\d+)\b/g, 'C<sub>$1</sub>');
  // Operators
  s = s.replace(/\s\*\s/g, ' · ');
  s = s.replace(/\*/g, '·');
  return s;
}

function _splitTopLevel(expr, sep) {
  let depth = 0;
  for (let i = 0; i <= expr.length - sep.length; i++) {
    const c = expr[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (depth === 0 && expr.substr(i, sep.length) === sep) {
      return [expr.substring(0, i), expr.substring(i + sep.length)];
    }
  }
  return null;
}

function _stripOuterParens(s) {
  s = s.trim();
  if (!(s.startsWith('(') && s.endsWith(')'))) return s;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') { depth--; if (depth === 0 && i < s.length - 1) return s; }
  }
  return s.slice(1, -1);
}

function _renderSide(expr) {
  const div = _splitTopLevel(expr, ' / ');
  if (div) {
    return `<span class="frac"><span class="frac-num">${_renderInline(_stripOuterParens(div[0]))}</span><span class="frac-den">${_renderInline(_stripOuterParens(div[1]))}</span></span>`;
  }
  return _renderInline(expr);
}

function formatFormula(s) {
  let parts = s.split(' ~= ');
  let op = '≈';
  if (parts.length !== 2) { parts = s.split(' = '); op = '='; }
  if (parts.length !== 2) return _renderInline(s);
  return `<span class="formula-lhs">${_renderSide(parts[0])}</span> <span class="formula-op">${op}</span> <span class="formula-rhs">${_renderSide(parts[1])}</span>`;
}

// ── Engineering-notation number parsing / formatting ────────────────────────
// Accepts "10k", "100u", "1.5", "2.2 nF", "60%", etc. Returns base-unit number
// (Ω, F, s, Hz) or null on parse failure.
function parseEngValue(s) {
  if (s == null) return null;
  let t = String(s).trim();
  if (!t) return null;
  // Strip a trailing unit letter (R, F, s, Hz, Ω) so "2.2 nF" works.
  t = t.replace(/(?:Ω|ohms?|F|farads?|s|sec(?:onds?)?|Hz|hertz)\s*$/i, '').trim();
  const m = t.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([pnuµmkKMG]?)$/);
  if (!m) return null;
  const base = parseFloat(m[1]);
  if (!isFinite(base)) return null;
  const mults = { '': 1, p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  return base * (mults[m[2]] ?? 1);
}

function parsePercent(s) {
  if (s == null) return null;
  const t = String(s).trim().replace(/%\s*$/, '').trim();
  if (!t) return null;
  const v = parseFloat(t);
  if (!isFinite(v)) return null;
  return v / 100;
}

function formatEng(v, unit) {
  if (v == null || !isFinite(v)) return '';
  const abs = Math.abs(v);
  if (abs === 0) return '0 ' + unit;
  const steps = [
    [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''],
    [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'],
  ];
  let pick = steps[steps.length - 1];
  for (const step of steps) { if (abs >= step[0]) { pick = step; break; } }
  const scaled = v / pick[0];
  const str = Math.abs(scaled) >= 100 ? scaled.toFixed(1)
            : Math.abs(scaled) >= 10  ? scaled.toFixed(2)
            :                            scaled.toFixed(3);
  return str.replace(/\.?0+$/, '') + ' ' + pick[1] + unit;
}

function formatPercent(v) {
  if (v == null || !isFinite(v)) return '';
  return (v * 100).toFixed(1).replace(/\.?0+$/, '') + ' %';
}

// ── Calculators ─────────────────────────────────────────────────────────────
function _calcInputRow(uid, key, label, unit, placeholder) {
  const id = `${uid}-${key}`;
  return `<label class="chip-calc-row" for="${id}"><span class="chip-calc-label">${label}</span><input class="chip-calc-input" id="${id}" data-key="${key}" type="text" autocomplete="off" spellcheck="false" placeholder="${escHtml(placeholder)}"><span class="chip-calc-unit">${unit}</span></label>`;
}

function buildCalculator(type, uid) {
  if (type === '555-astable') {
    return `<div class="chip-calc" data-calc-type="555-astable" data-calc-uid="${uid}">
      <div class="chip-calc-header">
        <div class="chip-calc-title">555 Astable Calculator</div>
        <button type="button" class="chip-calc-clear">Clear</button>
      </div>
      <div class="chip-calc-grid">
        <div class="chip-calc-col">
          <div class="chip-calc-colhead">Components</div>
          ${_calcInputRow(uid, 'R1', 'R<sub>1</sub>', 'Ω', '')}
          ${_calcInputRow(uid, 'R2', 'R<sub>2</sub>', 'Ω', '')}
          ${_calcInputRow(uid, 'C',  'C',              'F', '')}
        </div>
        <div class="chip-calc-col">
          <div class="chip-calc-colhead">Timing</div>
          ${_calcInputRow(uid, 'tHIGH', 't<sub>HIGH</sub>', 's',  '')}
          ${_calcInputRow(uid, 'tLOW',  't<sub>LOW</sub>',  's',  '')}
          ${_calcInputRow(uid, 'f',     'f',                'Hz', '')}
          ${_calcInputRow(uid, 'duty',  'Duty',             '%',  '')}
        </div>
      </div>
      <div class="chip-calc-msg" aria-live="polite"></div>
    </div>`;
  }
  if (type === '555-monostable') {
    return `<div class="chip-calc" data-calc-type="555-monostable" data-calc-uid="${uid}">
      <div class="chip-calc-header">
        <div class="chip-calc-title">555 Type Monostable Calculator</div>
        <button type="button" class="chip-calc-clear">Clear</button>
      </div>
      <div class="chip-calc-grid chip-calc-grid-one">
        <div class="chip-calc-col">
          ${_calcInputRow(uid, 'R', 'R',           'Ω', '')}
          ${_calcInputRow(uid, 'C', 'C',           'F', '')}
          ${_calcInputRow(uid, 't', 'Pulse width', 's', '')}
        </div>
      </div>
      <div class="chip-calc-msg" aria-live="polite"></div>
    </div>`;
  }
  return '';
}

function _solveAstable(state) {
  // Underlying equations (NE555 astable):
  //   tHIGH = 0.693·(R1+R2)·C        tLOW = 0.693·R2·C
  //   f     = 1 / (tHIGH+tLOW) = 1 / (0.693·(R1+2R2)·C)
  //   duty  = tHIGH / (tHIGH+tLOW)   = (R1+R2)/(R1+2R2)
  let changed = true, iters = 0;
  while (changed && iters++ < 12) {
    changed = false;
    const set = (k, v) => { if (state[k] == null && isFinite(v)) { state[k] = v; changed = true; } };
    // Forward: components → timing
    if (state.R1 != null && state.R2 != null && state.C != null)
      set('tHIGH', 0.693 * (state.R1 + state.R2) * state.C);
    if (state.R2 != null && state.C != null)
      set('tLOW', 0.693 * state.R2 * state.C);
    if (state.tHIGH != null && state.tLOW != null) {
      set('f', 1 / (state.tHIGH + state.tLOW));
      set('duty', state.tHIGH / (state.tHIGH + state.tLOW));
    }
    // f, C, R1 → R2   (and the mirror case)
    if (state.f != null && state.C != null && state.R1 != null && state.f !== 0 && state.C !== 0)
      set('R2', (1 / (0.693 * state.f * state.C) - state.R1) / 2);
    if (state.f != null && state.C != null && state.R2 != null && state.f !== 0 && state.C !== 0)
      set('R1', 1 / (0.693 * state.f * state.C) - 2 * state.R2);
    // duty + one resistor → the other resistor
    if (state.duty != null && state.R1 != null && state.duty > 0.5 && state.duty < 1)
      set('R2', state.R1 * (1 - state.duty) / (2 * state.duty - 1));
    if (state.duty != null && state.R2 != null && state.duty > 0.5 && state.duty < 1)
      set('R1', state.R2 * (2 * state.duty - 1) / (1 - state.duty));
    // Period and duty give the two times
    if (state.f != null && state.duty != null) {
      set('tHIGH', state.duty / state.f);
      set('tLOW', (1 - state.duty) / state.f);
    }
    // Reverse: timing → components
    if (state.tLOW != null && state.C != null && state.C !== 0)
      set('R2', state.tLOW / (0.693 * state.C));
    if (state.tHIGH != null && state.R2 != null && state.C != null && state.C !== 0)
      set('R1', state.tHIGH / (0.693 * state.C) - state.R2);
    if (state.tHIGH != null && state.R1 != null && state.C != null && state.C !== 0)
      set('R2', state.tHIGH / (0.693 * state.C) - state.R1);
    if (state.tHIGH != null && state.R1 != null && state.R2 != null && (state.R1 + state.R2) !== 0)
      set('C', state.tHIGH / (0.693 * (state.R1 + state.R2)));
    if (state.tLOW != null && state.R2 != null && state.R2 !== 0)
      set('C', state.tLOW / (0.693 * state.R2));
  }
  return state;
}

function _solveMonostable(state) {
  if (state.t == null && state.R != null && state.C != null) state.t = 1.1 * state.R * state.C;
  else if (state.R == null && state.t != null && state.C != null && state.C !== 0) state.R = state.t / (1.1 * state.C);
  else if (state.C == null && state.t != null && state.R != null && state.R !== 0) state.C = state.t / (1.1 * state.R);
  return state;
}

function _readInputs(root, fields) {
  const state = {};
  for (const [key, kind] of Object.entries(fields)) {
    const el = root.querySelector(`input[data-key="${key}"]`);
    // Only user-typed values count as "known" — values written by a previous
    // Solve (data-user="0") get cleared so the new Solve recomputes them.
    if (!el || el.dataset.user !== '1') { state[key] = null; continue; }
    const raw = el.value;
    const v = kind === 'percent' ? parsePercent(raw) : parseEngValue(raw);
    state[key] = v;
  }
  return state;
}

function _writeOutputs(root, state, fields, userFilled) {
  for (const [key, kind] of Object.entries(fields)) {
    if (userFilled.has(key)) continue;
    const el = root.querySelector(`input[data-key="${key}"]`);
    if (!el) continue;
    const v = state[key];
    if (v == null || !isFinite(v)) { el.value = ''; el.removeAttribute('data-user'); continue; }
    el.value = kind === 'percent' ? formatPercent(v) : formatEng(v, '');
    el.dataset.user = '0';
  }
}

function attachCalculator(root) {
  const type = root.dataset.calcType;
  const msg = root.querySelector('.chip-calc-msg');
  const setMsg = (text, isErr) => { msg.textContent = text || ''; msg.classList.toggle('chip-calc-msg-err', !!isErr); };

  let fields, solve, validate;
  if (type === '555-astable') {
    fields = { R1: 'eng', R2: 'eng', C: 'eng', tHIGH: 'eng', tLOW: 'eng', f: 'eng', duty: 'percent' };
    solve = _solveAstable;
    validate = (state) => {
      if (state.duty != null && (state.duty <= 0.5 || state.duty >= 1))
        return 'Standard astable duty must be > 50% and < 100%.';
      if (state.R1 != null && state.R1 < 0) return 'R₁ came out negative — check your inputs.';
      if (state.R2 != null && state.R2 < 0) return 'R₂ came out negative — check your inputs.';
      return null;
    };
  } else if (type === '555-monostable') {
    fields = { R: 'eng', C: 'eng', t: 'eng' };
    solve = _solveMonostable;
    validate = () => null;
  } else return;

  const runSolve = () => {
    const state = _readInputs(root, fields);
    const userFilled = new Set(Object.keys(state).filter(k => state[k] != null));
    // Bad input check: any user-typed box that failed to parse
    for (const key of Object.keys(fields)) {
      const el = root.querySelector(`input[data-key="${key}"]`);
      if (el && el.dataset.user === '1' && el.value.trim() && state[key] == null) {
        setMsg(`Couldn't parse "${el.value}" for ${key}.`, true);
        return;
      }
    }
    if (userFilled.size === 0) { setMsg(''); return; }
    solve(state);
    const warn = validate(state);
    const stillMissing = Object.keys(fields).filter(k => state[k] == null);
    _writeOutputs(root, state, fields, userFilled);
    const unknownCount = Object.keys(fields).length - userFilled.size;
    if (stillMissing.length >= unknownCount && unknownCount > 0) {
      setMsg(warn || 'Not enough information, enter more values.', true);
    } else if (stillMissing.length > 0) {
      setMsg(warn || `Solved partially, couldn't determine: ${stillMissing.join(', ')}.`, !!warn);
    } else {
      setMsg(warn || '', !!warn);
    }
  };

  // Any keystroke marks the field as user-entered, then auto-solves.
  root.querySelectorAll('input[data-key]').forEach(el => {
    el.addEventListener('input', () => {
      el.dataset.user = el.value.trim() ? '1' : '';
      runSolve();
    });
  });

  root.querySelector('.chip-calc-clear').addEventListener('click', () => {
    root.querySelectorAll('input[data-key]').forEach(el => {
      el.value = '';
      el.removeAttribute('data-user');
    });
    setMsg('');
  });
}

function chipOverview(def) {
  if (def.guideOverview) return def.guideOverview;
  const gt = def.gates?.[0]?.type ?? '';
  const gateCount = def.gates?.length ?? 0;
  const multi = gateCount > 1 ? `${gateCount}x ` : '';
  switch (gt) {
    case 'NAND': return `${multi}NAND gate. Output is LOW only when all inputs are HIGH, otherwise HIGH. The NAND is a universal gate: any logic function can be built from NANDs alone.`;
    case 'NOR':  return `${multi}NOR gate. Output is HIGH only when all inputs are LOW, otherwise LOW. Like NAND, NOR is universal and can implement any Boolean function.`;
    case 'AND':  return `${multi}AND gate. Output is HIGH only when all inputs are HIGH, otherwise LOW.`;
    case 'OR':   return `${multi}OR gate. Output is HIGH when any input is HIGH, LOW only when all inputs are LOW.`;
    case 'NOT':  return `${multi}Inverter. Each gate drives its output to the logical complement of its input: HIGH in → LOW out, LOW in → HIGH out.`;
    case 'XOR':  return `${multi}Exclusive-OR gate. Output is HIGH when the two inputs differ. Useful for parity generation, binary addition, and controlled inversion.`;
    case 'XNOR': return `${multi}Exclusive-NOR gate. Output is HIGH when both inputs match. Opposite of XOR, useful for equality detection.`;
    case 'BUFFER': return `${multi}Non inverting buffer. Output follows the input with no logic inversion. Used to boost drive strength when a signal needs to fan out to many loads.`;
    default: return '';
  }
}

function describePinName(name, def) {
  const n = name.toUpperCase();
  if (def.guidePinDescriptions) {
    for (const [k, v] of Object.entries(def.guidePinDescriptions)) {
      if (k.toUpperCase() === n) return v;
    }
  }
  if (n === 'VCC') return 'Power input';
  if (n === 'GND') return 'Ground';
  if (/^NC\d*$/.test(n)) return 'No connect';
  if (n === 'CLK' || n === 'CK' || n === 'CP') return 'Clock input, rising edge triggered';
  if (n === 'CLR' || n === 'MR') return 'Clear, active LOW';
  if (n === 'PRE' || n === 'SD') return 'Preset, active LOW';
  if (n === 'OE')  return 'Output enable, active LOW';
  if (n === 'LE')  return 'Latch enable';
  if (n === 'WE')  return 'Write enable, active LOW';
  if (n === 'CE' || n === 'EP' || n === 'ET') return 'Count enable';
  if (n === 'PE' || n === 'LOAD') return 'Parallel load, active LOW';
  if (n === 'DIR') return 'Direction';
  if (n === 'Q')   return 'Q output';
  if (n === 'QN')  return 'Inverted Q output (Q̅)';
  if (/^Q[A-H]$/.test(n)) return `Bit ${n.charCodeAt(1) - 65} output`;
  if (/^\d+CLK$/.test(n)) return `Clock for flip flop ${n.match(/^(\d+)/)[1]}, rising edge`;
  if (/^\d+CLR$/.test(n)) return `Clear for flip flop ${n.match(/^(\d+)/)[1]}, active LOW`;
  if (/^\d+PRE$/.test(n)) return `Preset for flip flop ${n.match(/^(\d+)/)[1]}, active LOW`;
  if (/^\d+D$/.test(n))   return `Data input for bit ${n.match(/^(\d+)/)[1]}`;
  const nq = n.match(/^(\d+)(QN?)$/);
  if (nq) return nq[2] === 'QN' ? `Inverted Q for bit ${nq[1]}` : `Q output for bit ${nq[1]}`;
  const go = n.match(/^(\d+)Y$/);
  if (go) return `Gate ${go[1]} output`;
  const gi = n.match(/^(\d+)([A-D])$/);
  if (gi) return `Gate ${gi[1]}, input ${gi[2]}`;
  const jk = n.match(/^(\d+)([JK])$/);
  if (jk) return `${jk[2] === 'J' ? 'J (set)' : 'K (reset)'} input ${jk[1]}`;
  if (n === 'Y') return 'Gate output';
  if (n === 'J') return 'J input';
  if (n === 'K') return 'K input';
  if (n === 'D') return 'Data input';
  if (/^[A-H]$/.test(n)) return `Input ${n}`;
  if (/^D\d$/.test(n)) return `Data bit ${n[1]}`;
  if (/^A\d$/.test(n)) return `Address / input bit ${n[1]}`;
  if (/^B\d$/.test(n)) return `B-side bit ${n[1]}`;
  if (/^S\d$/.test(n)) return `Select bit ${n[1]}`;
  if (/^I\d$/.test(n)) return `Input bit ${n[1]}`;
  if (/^O\d$/.test(n)) return `Output bit ${n[1]}`;
  return '';
}

function buildGuideSection(section, uid) {
  let h = `<div class="chip-ref-guide-subtitle">${escHtml(section.title)}</div>`;
  if (section.image?.src) {
    const imgStyle = section.image.citation ? ' style="background:#fff;"' : '';
    h += `<figure class="chip-ref-guide-figure"><img class="chip-ref-guide-image"${imgStyle} src="${section.image.src}" alt="${escHtml(section.image.alt || section.title)}">`;
    if (section.image.caption) h += `<figcaption class="chip-ref-guide-caption">${escHtml(section.image.caption)}</figcaption>`;
    if (section.image.citation) h += `<div class="chip-ref-guide-citation"><a href="${escHtml(section.image.citation.href)}" target="_blank" rel="noopener noreferrer">${escHtml(section.image.citation.title)}</a></div>`;
    h += '</figure>';
  }
  for (const p of section.paragraphs || []) {
    h += `<div class="chip-ref-guide-paragraph">${escHtml(p)}</div>`;
  }
  if (section.formulas?.length) {
    h += '<div class="chip-ref-guide-formulas">';
    for (const f of section.formulas) h += `<div class="chip-ref-guide-formula">${formatFormula(f)}</div>`;
    h += '</div>';
  }
  if (section.calculator?.type) {
    h += buildCalculator(section.calculator.type, uid);
  }
  if (section.list?.length) {
    if (!/use/i.test(section.title)) h += '<div class="chip-ref-guide-list-label">Common uses:</div>';
    h += '<ul class="chip-ref-guide-list">';
    for (const item of section.list) h += `<li>${escHtml(item)}</li>`;
    h += '</ul>';
  }
  if (section.note) h += `<div class="chip-ref-guide-note">${escHtml(section.note)}</div>`;
  return h;
}

function buildDipSvg(def, uid) {
  const half = def.pins / 2;
  const ACTIVE_LOW_NAMES = new Set(['CLR', 'MR', 'RST', 'RESET', '1CLR', '2CLR', '1MR', '2MR']);
  const isActiveLow = p => ACTIVE_LOW_NAMES.has(p.name) || (p.name.length > 1 && p.name.endsWith('n')) || /active[\s-]low/i.test(p.description || '');
  const dipName = p => isActiveLow(p) && p.name.endsWith('n') ? p.name.slice(0, -1) : p.name;
  const maxNameLen = def.pinout.length ? Math.max(...def.pinout.map(p => dipName(p).length)) : 0;
  const pinSp  = Math.max(28, Math.ceil(maxNameLen * 5.2) + 12);
  const notch  = 22, padR = 12, bH = 78, legLen = 11, legW = 3.5, nameH = 14, pinGap = 6;
  const svgW     = notch + half * pinSp + padR;
  const bodyTopY = nameH + pinGap + legLen + 2;
  const bodyBotY = bodyTopY + bH;
  const svgH     = bodyBotY + legLen + nameH + 2;
  const bcy      = bodyTopY + bH / 2;
  const typeCol  = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : t === 'nc' ? '#888' : '#fd6';
  const px = i => notch + i * pinSp + pinSp / 2;

  let s = `<svg class="chip-dip-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;

  // Top pins
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[def.pins - 1 - i];
    const x = px(i);
    const col = pin ? typeCol(pin.type) : '#888';
    if (pin) {
      s += `<text x="${x}" y="${nameH - 1}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="9" font-weight="bold" fill="${col}">${dipName(pin)}</text>`;
      if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += `<line x1="${(x - hw).toFixed(1)}" y1="${nameH - 10}" x2="${(x + hw).toFixed(1)}" y2="${nameH - 10}" stroke="${col}" stroke-width="0.9"/>`; }
    }
    s += `<rect x="${x - legW / 2}" y="${nameH + pinGap}" width="${legW}" height="${legLen}" fill="#aaaaaa"/>`;
  }

  // Body
  s += `<rect x="0" y="${bodyTopY}" width="${svgW}" height="${bH}" rx="2" fill="#111" stroke="#222" stroke-width="0.8"/>`;
  // Notch
  s += `<circle cx="0" cy="${bcy}" r="6" fill="#555"/>`;
  s += `<path d="M 0,${(bcy - 6).toFixed(1)} A 6,6 0 0 1 0,${(bcy + 6).toFixed(1)}" fill="none" stroke="#777" stroke-width="0.8"/>`;
  // Pin-1 indicator dot
  s += `<circle cx="11" cy="${bcy}" r="2.2" fill="#0d0d0d"/>`;

  // Top pin numbers inside body
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[def.pins - 1 - i];
    s += `<text x="${px(i)}" y="${bodyTopY + 13}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="7.5" fill="#666">${pin ? pin.pin : ''}</text>`;
  }

  // Chip name
  s += `<text x="${svgW / 2}" y="${bcy + 4}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="11" font-weight="bold" fill="#d8d4cc" letter-spacing="1.8">${def.name}</text>`;

  // Bottom pin numbers inside body
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[i];
    s += `<text x="${px(i)}" y="${bodyBotY - 4}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="7.5" fill="#666">${pin ? pin.pin : ''}</text>`;
  }

  // Bottom pins
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[i];
    const x = px(i);
    const col = pin ? typeCol(pin.type) : '#888';
    s += `<rect x="${x - legW / 2}" y="${bodyBotY}" width="${legW}" height="${legLen}" fill="#aaaaaa"/>`;
    if (pin) {
      s += `<text x="${x}" y="${bodyBotY + legLen + nameH - 1}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="9" font-weight="bold" fill="${col}">${dipName(pin)}</text>`;
      if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += `<line x1="${(x - hw).toFixed(1)}" y1="${bodyBotY + legLen + nameH - 10}" x2="${(x + hw).toFixed(1)}" y2="${bodyBotY + legLen + nameH - 10}" stroke="${col}" stroke-width="0.9"/>`; }
    }
  }

  s += '</svg>';
  return s;
}

function buildChipArticleHtml(chipKey, def, idx) {
  const overview = chipOverview(def);
  const sorted = [...def.pinout].sort((a, b) => a.pin - b.pin);
  const pinTypeColor = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : t === 'nc' ? '#888' : '#fd6';
  const hasNc = sorted.some(p => p.type === 'nc');
  let pinRows = '';
  for (const p of sorted) {
    const col = pinTypeColor(p.type);
    pinRows += `<tr><td class="cg-pin">${p.pin}</td><td class="cg-name" style="color:${col}">${escHtml(p.displayName || p.name)}</td><td class="cg-desc">${escHtml(describePinName(p.name, def))}</td></tr>`;
  }
  const legendHtml = `<div class="chip-ref-pinout-legend"><span class="chip-ref-legend-input">● Input</span> <span class="chip-ref-legend-output">● Output</span> <span class="chip-ref-legend-power">● Power</span>${hasNc ? ' <span class="chip-ref-legend-nc">● No Connect</span>' : ''}</div>`;
  let guideSectionsHtml = '';
  if (Array.isArray(def.guideSections)) {
    let si = 0;
    for (const section of def.guideSections) {
      if (section?.title) guideSectionsHtml += buildGuideSection(section, `calc-${idx}-${si++}`);
    }
  }
  const datasheetHtml = def.datasheet
    ? `<a class="chip-ref-datasheet" href="${def.datasheet}" target="_blank" rel="noopener">View Datasheet ↗</a>`
    : '';
  const isStub = Array.isArray(def.tags) && def.tags.includes('stub');
  const notSimulated = !isStub && chipIsNotSimulated(def);
  const unverifiedBanner = !def.datasheet && !isStub && !notSimulated
    ? `<div class="chip-ref-unverified">⚠ No verified datasheet for this part simulation characteristics may be inaccurate. <a href="/docs#unverified-chips">Learn more about unverified chips</a> or <a href="/bug-report">submit a bug report</a> if you have a datasheet or spot an error.</div>`
    : '';
  const stubBanner = isStub
    ? `<div class="chip-ref-stub"><strong>Info sheet only.</strong> This page documents the real-world part (pinout, function, notes) for reference, but the chip is <em>not</em> available for placement in the simulator and has no functional logic wired up.</div>`
    : '';
  const notSimBanner = notSimulated
    ? `<div class="chip-ref-notsim"><strong>Not simulated.</strong> This part can be placed on the breadboard, but 74Sim does <em>not</em> model its internal logic — when placed, its outputs stay high-impedance (inert) no matter what the inputs do. The pinout and description below are accurate for reference; the simulated behaviour is not. <a href="/bug-report">Let us know</a> if you need this part to work.</div>`
    : '';
  const descriptionHtml = def.description
    ? `<div class="chip-ref-chip-description">${escHtml(def.description)}</div>`
    : '';
  return `
    ${stubBanner}
    ${notSimBanner}
    ${unverifiedBanner}
    ${datasheetHtml}
    <div class="chip-ref-dip-wrap">${buildDipSvg(def, String(idx))}</div>
    ${legendHtml}
    ${descriptionHtml}
    <div class="chip-ref-guide">
      ${overview ? `<div class="chip-ref-guide-overview">${overview}</div>` : ''}
      <div class="chip-ref-guide-subtitle">Pinout</div>
      <table class="chip-ref-guide-table"><tbody>${pinRows}</tbody></table>
      ${guideSectionsHtml}
    </div>`;
}

// ── Link injection for chip reference articles ────────────────────────────────

function _extractCtEntries() {
  const art = document.getElementById('article-common-terms');
  if (!art) return [];
  const entries = [];
  for (const h2 of art.querySelectorAll('h2[id^="ct-"]')) {
    const text = h2.textContent.trim();
    const m = text.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*$/);
    const primary = m ? m[1].trim() : text;
    const alt = m && m[2] ? m[2].trim() : null;
    if (primary) entries.push([primary, '#' + h2.id]);
    if (alt && !/^[A-Z0-9]{2,4}$/.test(alt)) entries.push([alt, '#' + h2.id]);
  }
  return entries;
}

function _buildChipLinkTerms(jsonData) {
  const ctRaw = _extractCtEntries();
  const wikiRaw = [];
  for (const cat of jsonData.categories) {
    for (const t of cat.terms) {
      const m = t.term.match(/^([^(]+?)(?:\s*\(([^)]+)\))?\s*$/);
      const primary = m ? m[1].trim() : t.term;
      const alt = m && m[2] ? m[2].trim() : null;
      wikiRaw.push([primary, t.url]);
      if (alt && !/^[A-Z0-9]{2,4}$/.test(alt)) wikiRaw.push([alt, t.url]);
    }
  }
  ctRaw.sort((a, b) => b[0].length - a[0].length);
  wikiRaw.sort((a, b) => b[0].length - a[0].length);
  const seen = new Set();
  const terms = [];
  for (const entry of [...ctRaw, ...wikiRaw]) {
    const key = entry[0].toLowerCase();
    if (!seen.has(key)) { seen.add(key); terms.push(entry); }
  }
  return terms;
}

// Regions where link injection is never applied — mirrors inject_links.py PROTECTED_RE.
// SVG is added here to guard the DIP diagram's <text> pin labels.
const _CHIP_PROTECTED_RE = /<a\b[^>]*>[\s\S]*?<\/a>|<svg\b[^>]*>[\s\S]*?<\/svg>|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|<kbd\b[^>]*>[\s\S]*?<\/kbd>|<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|<table\b[^>]*>[\s\S]*?<\/table>|<[^>]+>/gi;

function _applyLinksSegment(text, linked, terms) {
  let chunks = [[text, false]];
  for (const [term, url] of terms) {
    const key = term.toLowerCase();
    if (linked.has(key)) continue;
    const pat = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    let found = false;
    const next = [];
    for (const [ct, prot] of chunks) {
      if (prot || found) { next.push([ct, prot]); continue; }
      const rep = ct.replace(pat, match => { found = true; return `<a href="${url}" target="_blank" rel="noopener">${match}</a>`; });
      if (found) {
        for (const part of rep.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/i)) {
          if (part) next.push([part, /^<a\b/i.test(part)]);
        }
      } else {
        next.push([ct, false]);
      }
    }
    if (found) { linked.add(key); chunks = next; }
  }
  return chunks.map(([t]) => t).join('');
}

function _applyLinksToHtml(html, terms) {
  const linked = new Set();
  let out = '';
  let last = 0;
  _CHIP_PROTECTED_RE.lastIndex = 0;
  let m;
  while ((m = _CHIP_PROTECTED_RE.exec(html)) !== null) {
    const gap = html.slice(last, m.index);
    if (gap) out += _applyLinksSegment(gap, linked, terms);
    out += m[0];
    last = m.index + m[0].length;
  }
  const tail = html.slice(last);
  if (tail) out += _applyLinksSegment(tail, linked, terms);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

const keys = Object.keys(CHIP_DB).sort((a, b) => {
  const na = parseInt(a.replace(/\D/g, '')) || 0;
  const nb = parseInt(b.replace(/\D/g, '')) || 0;
  return na - nb;
});

const main = document.getElementById('docs-main');
const sidebarGroup = document.getElementById('sidebar-chipref-group');
sidebarGroup.style.display = '';

// ── Chip Search Article ──────────────────────────────────────────────────────
const searchSideBtn = document.createElement('button');
searchSideBtn.className = 'sidebar-link';
searchSideBtn.dataset.article = 'chip-ref-search';
searchSideBtn.textContent = t('docsSearch.search', { def: 'Search' });
sidebarGroup.appendChild(searchSideBtn);

const searchArticle = document.createElement('article');
searchArticle.className = 'doc-article';
searchArticle.id = 'article-chip-ref-search';
searchArticle.innerHTML = `
  <div class="article-breadcrumb">
    ${t('docsSearch.chipReference', { def: 'Chip Reference' })}
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2.5l3 2.5-3 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ${t('docsSearch.search', { def: 'Search' })}
  </div>
  <h1>${t('docsSearch.title', { def: 'Chip Search' })}</h1>
  <p class="lead">${t('docsSearch.lead', { def: 'Search for any chip available in 74Sim. Click a result to open its reference page.' })}</p>
  <div class="chip-search-wrap">
    <input type="text" id="docs-chip-search" class="chip-search-input" placeholder="${t('docsSearch.placeholder', { def: 'Search chips' })}">
  </div>
  <div id="docs-chip-results" class="chip-search-results"></div>
`;
main.appendChild(searchArticle);

function renderDocsChipSearch(query) {
  const results = document.getElementById('docs-chip-results');
  const ids = searchChips(query, { sortByNumber: !query, includeStubs: true });
  if (!ids.length) {
    results.innerHTML = `<div class="chip-search-empty">${t('docsSearch.noChips', { def: 'No chips found.' })}</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const id of ids) {
    const def = CHIP_DB[id];
    const displayName = def.datasheet ? def.name : '*' + def.name;
    const item = document.createElement('div');
    item.className = 'chip-search-result';
    item.innerHTML = `<span class="csr-name">${escHtml(displayName)}</span><span class="csr-desc">${escHtml(def.description || '')}</span>`;
    item.addEventListener('click', () => window.__showArticle('chip-' + id));
    frag.appendChild(item);
  }
  results.innerHTML = '';
  results.appendChild(frag);
}

document.getElementById('docs-chip-search').addEventListener('input', e => renderDocsChipSearch(e.target.value));
renderDocsChipSearch('');
// ────────────────────────────────────────────────────────────────────────────

fetch('/helperscripts/linkable-terms.json')
  .then(r => r.json())
  .then(data => _buildChipLinkTerms(data))
  .catch(() => [])
  .then(terms => {
    keys.forEach((key, idx) => {
      const def = CHIP_DB[key];

      // Sidebar button
      const btn = document.createElement('button');
      btn.className = 'sidebar-link';
      btn.dataset.chipId = key;
      btn.textContent = def.name;
      sidebarGroup.appendChild(btn);

      // Article
      const article = document.createElement('article');
      article.className = 'doc-article';
      article.id = 'article-chip-' + key;
      let html = buildChipArticleHtml(key, def, idx);
      if (terms.length) html = _applyLinksToHtml(html, terms);
      article.innerHTML = html;
      main.appendChild(article);
      article.querySelectorAll('.chip-calc').forEach(attachCalculator);
    });

    // Re-run hash routing now that articles exist
    window.__loadFromHash();
  });

// Load example projects list
loadExamples().then(examples => {
  const list = document.getElementById('examples-doc-list');
  if (!list) return;
  if (!examples.length) {
    list.innerHTML = `<li>${t('docsSearch.noExamples', { def: 'No examples found.' })}</li>`;
    return;
  }
  list.innerHTML = examples.map(ex => {
    const name = ex.name || ex.id;
    const desc = ex.description || '';
    return `<li><a class="example-card" href="/simulator?example=${encodeURIComponent(ex.id)}">
      <div class="example-card-name">${escHtml(name)}</div>
      ${desc ? `<div class="example-card-desc">${escHtml(desc)}</div>` : ''}
    </a></li>`;
  }).join('');
}).catch(() => {
  const list = document.getElementById('examples-doc-list');
  if (list) list.innerHTML = `<li>${t('docsSearch.loadError', { def: 'Could not load examples.' })}</li>`;
});
