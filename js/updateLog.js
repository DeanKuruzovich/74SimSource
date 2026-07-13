// ── 74Sim Update Log ─────────────────────────────────────────────────────────
// Fetches updates.json, compares the current version to the last version this
// browser saw (stored in localStorage), and pops up a changelog modal showing
// any new entries. Edit updates.json to publish a new update log.

const STORAGE_KEY = '74sim.lastSeenVersion';
const UPDATES_URL = 'updates.json';

// Parse "1.2.3" → [1, 2, 3]. Non numeric / missing parts become 0.
function parseVersion(v) {
  if (typeof v !== 'string') return [0, 0, 0];
  return v.replace(/^v/i, '').split('.').map(p => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

// Returns >0 if a > b, <0 if a < b, 0 if equal.
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLastSeen() {
  try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
}

function setLastSeen(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch (_) { /* ignore */ }
}

function buildModal(entries, currentVersion) {
  const overlay = document.createElement('div');
  overlay.id = 'update-log-overlay';
  overlay.className = 'update-log-overlay';

  const entriesHtml = entries.map(e => {
    const changes = Array.isArray(e.changes)
      ? e.changes.map(c => `<li>${escapeHtml(c)}</li>`).join('')
      : '';
    const date = e.date ? `<span class="update-log-date">${escapeHtml(e.date)}</span>` : '';
    return `
      <div class="update-log-entry">
        <div class="update-log-entry-head">
          <span class="update-log-version">Update ${escapeHtml(e.version)}</span>
          ${date}
        </div>
        <ul class="update-log-changes">${changes}</ul>
      </div>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="update-log-modal" role="dialog" aria-modal="true" aria-labelledby="update-log-title">
      <div class="update-log-header">
        <h2 class="update-log-title" id="update-log-title">What's New</h2>
        <button class="update-log-close" aria-label="Close">&times;</button>
      </div>
      <div class="update-log-body">${entriesHtml}</div>
    </div>
  `;

  const close = () => {
    setLastSeen(currentVersion);
    overlay.remove();
  };

  overlay.querySelector('.update-log-close').addEventListener('click', close);

  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  document.addEventListener('keydown', function onKey(ev) {
    if (ev.key === 'Escape') {
      document.removeEventListener('keydown', onKey);
      close();
    }
  });

  return overlay;
}

function updateVersionDisplay(version) {
  const el = document.getElementById('app-version');
  if (el) el.textContent = version;
}

let _cachedData = null;

function showUpdateModal() {
  if (!_cachedData) return;
  const current = _cachedData.current;
  const all = (Array.isArray(_cachedData.entries) ? _cachedData.entries : [])
    .filter(e => e && e.version && Array.isArray(e.changes) && e.changes.length > 0)
    .sort((a, b) => compareVersions(b.version, a.version));
  if (!all.length) return;
  if (document.getElementById('update-log-overlay')) return;
  const overlay = buildModal(all, current);
  document.body.appendChild(overlay);
}

async function init() {
  let data;
  try {
    const res = await fetch(UPDATES_URL, { cache: 'no-cache' });
    if (!res.ok) return;
    data = await res.json();
  } catch (_) {
    return;
  }

  _cachedData = data;
  const current = data && data.current;
  const all = (data && Array.isArray(data.entries)) ? data.entries : [];
  if (!current) return;

  // Always update the version display in the status bar.
  updateVersionDisplay(current);

  // Make the version badge clickable to show the full update log.
  const versionEl = document.getElementById('app-version');
  if (versionEl) {
    versionEl.style.cursor = 'pointer';
    versionEl.addEventListener('click', showUpdateModal);
  }

  if (!all.length) return;

  // First-time visitors: silently stamp current version and skip the popup.
  const rawLastSeen = getLastSeen();
  if (!rawLastSeen) {
    setLastSeen(current);
    return;
  }
  const lastSeen = rawLastSeen;

  // Same or newer than current - nothing to show.
  const isSemver = v => /^\d+(\.\d+)*$/.test(String(v).replace(/^v/i, ''));
  const isNewer = (isSemver(current) && isSemver(lastSeen))
    ? compareVersions(lastSeen, current) < 0
    : lastSeen !== current;
  if (!isNewer) return;

  // Only show the single newest entry, even if multiple updates shipped since last visit.
  // Skip entries with no changes (e.g. Beta placeholder).
  const newEntries = all
    .filter(e => {
      if (!e || !e.version) return false;
      if (!Array.isArray(e.changes) || e.changes.length === 0) return false;
      if (isSemver(e.version) && isSemver(lastSeen)) return compareVersions(e.version, lastSeen) > 0;
      return e.version !== lastSeen;
    })
    .sort((a, b) => compareVersions(b.version, a.version))
    .slice(0, 1);

  if (!newEntries.length) {
    setLastSeen(current);
    return;
  }

  const overlay = buildModal(newEntries, current);
  document.body.appendChild(overlay);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
