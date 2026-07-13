// ── 74Sim i18n runtime ───────────────────────────────────────────────────────
// Lightweight, dependency-free localization for the shared frontend (web + the
// Tauri desktop app, which has NO browser auto-translate, so this is the only
// path to non-English text there).
//
// Design:
//   • String catalogs live at /js/i18n/ui.<locale>.json and lessons.<locale>.json
//     (served by the existing /js static mount on web; bundled as assets on desktop).
//   • DOM text is tagged with data-i18n / data-i18n-html / data-i18n-placeholder /
//     data-i18n-title / data-i18n-aria-label and swapped by applyTranslations().
//   • JS-generated strings call t('key', {def:'English default'}).
//   • Onramp lesson prose is overlaid onto the source objects via localizeCourse().
//
// Fallback chain for every lookup: current-locale catalog → English catalog →
// caller-supplied default → the baked-in DOM/source English (never blanked).
// A missing key therefore degrades gracefully to English, never to an empty node.

export const SUPPORTED = ['en', 'es', 'zh', 'de', 'fr'];
export const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = '74sim.lang';

function normalize(raw) {
  const l = (raw || '').toLowerCase();
  if (l.startsWith('zh')) return 'zh';       // zh-CN, zh-Hans, zh-TW → zh (Simplified)
  const base = l.split('-')[0];
  return SUPPORTED.includes(base) ? base : null;
}

function detectLocale() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    const fromQuery = normalize(q);
    if (fromQuery) return fromQuery;
  } catch (_) { /* no location (non-browser) */ }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch (_) { /* storage blocked */ }
  try {
    const nav = normalize(navigator.language) ||
      normalize((navigator.languages || [])[0]);
    if (nav) return nav;
  } catch (_) { /* no navigator */ }
  return DEFAULT_LOCALE;
}

let LOCALE = detectLocale();
let UI = {};            // active-locale UI catalog
let EN = {};            // English UI catalog (fallback source)
let LESSONS = null;     // active-locale lessons catalog (lazy)

export function getLocale() { return LOCALE; }

export function setLocale(locale) {
  const l = normalize(locale) || DEFAULT_LOCALE;
  try { localStorage.setItem(STORAGE_KEY, l); } catch (_) { /* ignore */ }
  // Simplest correct behavior: reload so every string (incl. JS-built DOM and
  // canvas re-renders) picks up the new locale from a clean state.
  try { location.reload(); } catch (_) { /* non-browser */ }
}

async function loadJSON(url) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    return await r.json();
  } catch (_) {
    return null;
  }
}

// Resolve a UI key through the fallback chain. Returns null if no catalog has it
// (callers then keep the baked-in English rather than blanking the node).
function resolve(key) {
  if (LOCALE !== DEFAULT_LOCALE && UI[key] != null) return UI[key];
  if (EN[key] != null) return EN[key];
  return null;
}

export function t(key, opts) {
  const hit = resolve(key);
  const base = hit != null ? hit : (opts && 'def' in opts ? opts.def : key);
  if (opts && opts.vars) {
    return base.replace(/\{(\w+)\}/g, (m, name) =>
      (name in opts.vars ? String(opts.vars[name]) : m));
  }
  return base;
}

function applyOne(el) {
  const key = el.getAttribute('data-i18n');
  if (key) { const v = resolve(key); if (v != null) el.textContent = v; }

  const htmlKey = el.getAttribute('data-i18n-html');
  if (htmlKey) { const v = resolve(htmlKey); if (v != null) el.innerHTML = v; }

  const phKey = el.getAttribute('data-i18n-placeholder');
  if (phKey) { const v = resolve(phKey); if (v != null) el.setAttribute('placeholder', v); }

  const titleKey = el.getAttribute('data-i18n-title');
  if (titleKey) { const v = resolve(titleKey); if (v != null) el.setAttribute('title', v); }

  const ariaKey = el.getAttribute('data-i18n-aria-label');
  if (ariaKey) { const v = resolve(ariaKey); if (v != null) el.setAttribute('aria-label', v); }
}

export function applyTranslations(root = document) {
  if (LOCALE === DEFAULT_LOCALE && !Object.keys(EN).length) return; // nothing to do
  const sel = '[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-title],[data-i18n-aria-label]';
  const scope = root.nodeType === 1 && root.matches && root.matches(sel) ? [root] : [];
  root.querySelectorAll && root.querySelectorAll(sel).forEach(el => scope.push(el));
  scope.forEach(applyOne);
}

// ── Lesson overlay ───────────────────────────────────────────────────────────
// Loads the translated lessons catalog (once) for the active locale.
export async function loadLessons() {
  if (LOCALE === DEFAULT_LOCALE) return null;   // English source objects used as-is
  if (LESSONS === null) LESSONS = await loadJSON(`/js/i18n/lessons.${LOCALE}.json`) || {};
  return LESSONS;
}

// Returns a course object with translatable prose swapped for the active locale.
// Keys are course-scoped: "<course>.title", "<course>.blurb",
// "<course>.<lessonId>.title|description",
// "<course>.<lessonId>.<stepId>.title|content",
// "<course>.<lessonId>.<stepId>.hint.<i>.label". Missing keys keep the source.
export function localizeCourse(course) {
  if (LOCALE === DEFAULT_LOCALE || !LESSONS) return course;
  const cid = course.id;
  const tr = (suffix, fallback) => {
    const v = LESSONS[`${cid}.${suffix}`];
    return v != null ? v : fallback;
  };
  return {
    ...course,
    title: tr('title', course.title),
    blurb: tr('blurb', course.blurb),
    lessons: (course.lessons || []).map(les => ({
      ...les,
      title: tr(`${les.id}.title`, les.title),
      description: tr(`${les.id}.description`, les.description),
      steps: (les.steps || []).map(st => ({
        ...st,
        title: tr(`${les.id}.${st.id}.title`, st.title),
        content: tr(`${les.id}.${st.id}.content`, st.content),
        hint: st.hint && st.hint.targets ? {
          ...st.hint,
          targets: st.hint.targets.map((tg, i) => ({
            ...tg,
            label: tr(`${les.id}.${st.id}.hint.${i}.label`, tg.label),
          })),
        } : st.hint,
      })),
    })),
  };
}

// Wire any language <select class="i18n-lang-select"> to the current locale and
// switch (reload) on change. Idempotent; safe to run once on init.
function bindLangSelectors() {
  document.querySelectorAll('.i18n-lang-select').forEach(sel => {
    if (sel.dataset.i18nBound) return;
    sel.dataset.i18nBound = '1';
    sel.value = LOCALE;
    sel.addEventListener('change', () => setLocale(sel.value));
  });
}

// Pages can declare extra catalogs to merge into the UI namespace via
// <html data-i18n-catalog="docs">. Keeps big page-specific catalogs (e.g. the
// docs page) out of the simulator's load path while sharing t()/applyTranslations.
function extraCatalogs() {
  try {
    const v = document.documentElement.dataset.i18nCatalog;
    return v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
  } catch (_) { return []; }
}

// ── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  try { document.documentElement.lang = LOCALE; } catch (_) { /* non-browser */ }
  const extras = extraCatalogs();
  EN = await loadJSON('/js/i18n/ui.en.json') || {};
  for (const name of extras) Object.assign(EN, await loadJSON(`/js/i18n/${name}.en.json`) || {});
  if (LOCALE === DEFAULT_LOCALE) {
    UI = EN;
  } else {
    UI = await loadJSON(`/js/i18n/ui.${LOCALE}.json`) || {};
    for (const name of extras) Object.assign(UI, await loadJSON(`/js/i18n/${name}.${LOCALE}.json`) || {});
  }
  const run = () => { applyTranslations(document); bindLangSelectors(); };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }
}

// Resolves once the UI catalog is loaded and (if the DOM is ready) applied.
export const i18nReady = init();
