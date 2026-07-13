// ── 74Sim i18n drift guard ────────────────────────────────────────────────────
// Compares every locale catalog against the English source of truth and reports
// keys that are missing (need translation) or stale (present in a locale but no
// longer in English). Run before a release so untranslated strings surface loudly
// instead of silently falling back to English in the UI.
//
// Run:  node helperscripts/i18n-check.mjs
// Exits non-zero if any locale is missing keys (suitable for CI / test.mjs).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, '..', 'js', 'i18n');
const LOCALES = ['es', 'zh', 'de', 'fr'];
const CATALOGS = ['ui', 'lessons', 'docs'];

const load = (name) => {
  try { return JSON.parse(readFileSync(join(dir, name), 'utf8')); }
  catch (_) { return null; }
};

let missingTotal = 0;
let staleTotal = 0;

for (const cat of CATALOGS) {
  const en = load(`${cat}.en.json`);
  if (!en) { console.error(`✗ missing source catalog ${cat}.en.json`); missingTotal++; continue; }
  const enKeys = new Set(Object.keys(en));

  for (const loc of LOCALES) {
    const cur = load(`${cat}.${loc}.json`);
    if (!cur) {
      console.warn(`✗ ${cat}.${loc}.json not found (${enKeys.size} strings untranslated)`);
      missingTotal += enKeys.size;
      continue;
    }
    const curKeys = new Set(Object.keys(cur));
    const missing = [...enKeys].filter(k => !curKeys.has(k));
    const stale = [...curKeys].filter(k => !enKeys.has(k));
    missingTotal += missing.length;
    staleTotal += stale.length;

    const status = missing.length === 0 && stale.length === 0 ? '✓' : '•';
    console.log(`${status} ${cat}.${loc}: ${curKeys.size}/${enKeys.size} translated` +
      (missing.length ? `, ${missing.length} missing` : '') +
      (stale.length ? `, ${stale.length} stale` : ''));
    if (missing.length) console.log('    missing: ' + missing.slice(0, 8).join(', ') + (missing.length > 8 ? ' …' : ''));
    if (stale.length) console.log('    stale:   ' + stale.slice(0, 8).join(', ') + (stale.length > 8 ? ' …' : ''));
  }
}

console.log(`\n${missingTotal === 0 ? '✓ all locales complete' : `✗ ${missingTotal} strings need translation`}` +
  (staleTotal ? `, ${staleTotal} stale keys to prune` : ''));
process.exit(missingTotal === 0 ? 0 : 1);
