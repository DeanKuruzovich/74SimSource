import { CHIP_DB, searchChips } from '/js/chips.js';
import { loadExamples } from '/js/examples.js';

function escHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    case 'BUFFER': return `${multi}Non-inverting buffer. Output follows the input with no logic inversion. Used to boost drive strength when a signal needs to fan out to many loads.`;
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
  if (n === 'CLK' || n === 'CK' || n === 'CP') return 'Clock input, rising-edge triggered';
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
  if (/^\d+CLK$/.test(n)) return `Clock for flip-flop ${n.match(/^(\d+)/)[1]}, rising-edge`;
  if (/^\d+CLR$/.test(n)) return `Clear for flip-flop ${n.match(/^(\d+)/)[1]}, active LOW`;
  if (/^\d+PRE$/.test(n)) return `Preset for flip-flop ${n.match(/^(\d+)/)[1]}, active LOW`;
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

function buildGuideSection(section) {
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
    for (const f of section.formulas) h += `<div class="chip-ref-guide-formula">${escHtml(f)}</div>`;
    h += '</div>';
  }
  if (section.list?.length) {
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
  const typeCol  = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : '#fd6';
  const px = i => notch + i * pinSp + pinSp / 2;

  let s = `<svg class="chip-dip-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;

  // Top pins
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[def.pins - 1 - i];
    const x = px(i);
    const col = pin ? typeCol(pin.type) : '#888';
    if (pin) {
      s += `<text x="${x}" y="${nameH - 1}" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="9" font-weight="bold" fill="${col}">${dipName(pin)}</text>`;
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
    s += `<text x="${px(i)}" y="${bodyTopY + 13}" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="7.5" fill="#666">${pin ? pin.pin : ''}</text>`;
  }

  // Chip name
  s += `<text x="${svgW / 2}" y="${bcy + 4}" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="11" font-weight="bold" fill="#d8d4cc" letter-spacing="1.8">${def.name}</text>`;

  // Bottom pin numbers inside body
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[i];
    s += `<text x="${px(i)}" y="${bodyBotY - 4}" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="7.5" fill="#666">${pin ? pin.pin : ''}</text>`;
  }

  // Bottom pins
  for (let i = 0; i < half; i++) {
    const pin = def.pinout[i];
    const x = px(i);
    const col = pin ? typeCol(pin.type) : '#888';
    s += `<rect x="${x - legW / 2}" y="${bodyBotY}" width="${legW}" height="${legLen}" fill="#aaaaaa"/>`;
    if (pin) {
      s += `<text x="${x}" y="${bodyBotY + legLen + nameH - 1}" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="9" font-weight="bold" fill="${col}">${dipName(pin)}</text>`;
      if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += `<line x1="${(x - hw).toFixed(1)}" y1="${bodyBotY + legLen + nameH - 10}" x2="${(x + hw).toFixed(1)}" y2="${bodyBotY + legLen + nameH - 10}" stroke="${col}" stroke-width="0.9"/>`; }
    }
  }

  s += '</svg>';
  return s;
}

function buildChipArticleHtml(chipKey, def, idx) {
  const overview = chipOverview(def);
  const sorted = [...def.pinout].sort((a, b) => a.pin - b.pin);
  let pinRows = '';
  for (const p of sorted) {
    pinRows += `<tr><td class="cg-pin">${p.pin}</td><td class="cg-name">${escHtml(p.displayName || p.name)}</td><td class="cg-desc">${escHtml(describePinName(p.name, def))}</td></tr>`;
  }
  let guideSectionsHtml = '';
  if (Array.isArray(def.guideSections)) {
    for (const section of def.guideSections) {
      if (section?.title) guideSectionsHtml += buildGuideSection(section);
    }
  }
  const datasheetHtml = def.datasheet
    ? `<a class="chip-ref-datasheet" href="${def.datasheet}" target="_blank" rel="noopener">View Datasheet ↗</a>`
    : '';
  const unverifiedBanner = !def.datasheet
    ? `<div class="chip-ref-unverified">⚠ No verified datasheet for this part simulation characteristics may be inaccurate. <a href="docs.html#unverified-chips">Learn more about unverified chips</a> or <a href="simulator.html#bugreport">submit a bug report</a> if you have a datasheet or spot an error.</div>`
    : '';
  return `
    ${unverifiedBanner}
    <div class="chip-ref-dip-wrap">${buildDipSvg(def, String(idx))}</div>
    <div class="chip-ref-guide">
      ${overview ? `<div class="chip-ref-guide-overview">${overview}</div>` : ''}
      <div class="chip-ref-guide-subtitle">Pinout</div>
      <table class="chip-ref-guide-table"><tbody>${pinRows}</tbody></table>
      ${guideSectionsHtml}
    </div>
    ${datasheetHtml}`;
}

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
searchSideBtn.textContent = 'Search';
sidebarGroup.appendChild(searchSideBtn);

const searchArticle = document.createElement('article');
searchArticle.className = 'doc-article';
searchArticle.id = 'article-chip-ref-search';
searchArticle.innerHTML = `
  <div class="article-breadcrumb">
    Chip Reference
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2.5l3 2.5-3 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Search
  </div>
  <h1>Chip Search</h1>
  <p class="lead">Search for any chip available in 74Sim. Click a result to open its reference page.</p>
  <div class="chip-search-wrap">
    <input type="text" id="docs-chip-search" class="chip-search-input" placeholder="Search chips">
  </div>
  <div id="docs-chip-results" class="chip-search-results"></div>
`;
main.appendChild(searchArticle);

function renderDocsChipSearch(query) {
  const results = document.getElementById('docs-chip-results');
  const ids = searchChips(query, { sortByNumber: !query });
  if (!ids.length) {
    results.innerHTML = '<div class="chip-search-empty">No chips found.</div>';
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
  article.innerHTML = buildChipArticleHtml(key, def, idx);
  main.appendChild(article);
});

// Re-run hash routing now that articles exist
window.__loadFromHash();

// Load example projects list
loadExamples().then(examples => {
  const list = document.getElementById('examples-doc-list');
  if (!list) return;
  if (!examples.length) {
    list.innerHTML = '<li>No examples found.</li>';
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
  if (list) list.innerHTML = '<li>Could not load examples.</li>';
});
