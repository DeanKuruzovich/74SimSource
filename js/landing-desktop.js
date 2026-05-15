// Desktop (Tauri) landing screen.
// Handles "New Circuit", "Open File...", "Resume Last Session", and the recent
// files list. The actual circuit editor lives in /simulator.html.

import {
  isTauri, openStateFromFile,
  setCurrentFilePath, getRecentFiles, pushRecentFile,
  clearRecentFiles, basenameOf,
} from '/js/storage.js';

function tauriInvoke(cmd, args) {
  const t = globalThis.__TAURI__;
  if (!t || !t.core || !t.core.invoke) {
    return Promise.reject(new Error('Tauri runtime not available'));
  }
  return t.core.invoke(cmd, args);
}

function gotoSimulator() {
  window.location.href = '/simulator.html';
}

async function renderRecents() {
  const list = document.getElementById('desk-recent-list');
  if (!list) return;
  const files = getRecentFiles();
  list.innerHTML = '';
  if (files.length === 0) {
    const li = document.createElement('li');
    li.className = 'desk-recent-empty';
    li.textContent = 'No recent files yet.';
    list.appendChild(li);
    return;
  }
  for (const path of files) {
    const li = document.createElement('li');
    const name = await basenameOf(path);
    const nameEl = document.createElement('span');
    nameEl.className = 'desk-recent-name';
    nameEl.textContent = name || path;
    const pathEl = document.createElement('span');
    pathEl.className = 'desk-recent-path';
    pathEl.textContent = path;
    li.appendChild(nameEl);
    li.appendChild(pathEl);
    li.addEventListener('click', () => openRecent(path));
    list.appendChild(li);
  }
}

async function handoffToSimulator(path, data) {
  // The simulator's startup reads localStorage first (sync) then overlays the
  // FS autosave (async). Clear the stale localStorage entry so the FS autosave
  // — which we just wrote with the chosen file's contents — is what shows up.
  try { localStorage.removeItem('74sim_state'); } catch {}
  setCurrentFilePath(path);
  pushRecentFile(path);
  const json = JSON.stringify(data, null, 2);
  const autosavePath = await tauriInvoke('autosave_path');
  await tauriInvoke('write_text_file', { path: autosavePath, contents: json });
  gotoSimulator();
}

async function openRecent(path) {
  try {
    const result = await openStateFromFile(path);
    if (!result) return;
    await handoffToSimulator(result.path, result.data);
  } catch (e) {
    console.error('Open recent failed:', e);
    alert('Could not open file:\n' + (e?.message || e));
  }
}

async function newCircuit() {
  // Clear the persisted disk autosave so the simulator boots empty.
  try {
    const autosavePath = await tauriInvoke('autosave_path');
    await tauriInvoke('write_text_file', {
      path: autosavePath,
      contents: JSON.stringify({ components: [], wires: [], extraTiles: [], textBoxes: [] }, null, 2),
    });
  } catch {}
  // Also drop the localStorage current-file binding.
  setCurrentFilePath(null);
  // Clear localStorage circuit so the simulator starts fresh.
  try { localStorage.removeItem('74sim_state'); } catch {}
  gotoSimulator();
}

async function openDialog() {
  try {
    const result = await openStateFromFile();
    if (!result) return;
    await handoffToSimulator(result.path, result.data);
  } catch (e) {
    console.error('Open failed:', e);
    alert('Open failed:\n' + (e?.message || e));
  }
}

function openModal(backdropId) {
  const el = document.getElementById(backdropId);
  if (el) el.style.display = 'flex';
}
function closeModal(backdropId) {
  const el = document.getElementById(backdropId);
  if (el) el.style.display = 'none';
}

function setStatus(el, kind, msg) {
  el.className = 'desk-modal-status ' + kind;
  el.textContent = msg;
}

async function submitReport({ formId, descId, submitId, statusId, backdropId, kind }) {
  const submitBtn = document.getElementById(submitId);
  const statusEl  = document.getElementById(statusId);
  const descEl    = document.getElementById(descId);
  const description = descEl.value.trim();
  if (!description) return;

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  setStatus(statusEl, 'loading', 'Submitting...');

  try {
    await tauriInvoke('submit_report', { reportType: kind, description });
    setStatus(statusEl, 'success', 'Thanks — submitted!');
    descEl.value = '';
    submitBtn.textContent = 'Submitted';
    setTimeout(() => {
      closeModal(backdropId);
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      setStatus(statusEl, '', '');
    }, 1200);
  } catch (e) {
    setStatus(statusEl, 'error', String(e?.message || e));
    submitBtn.disabled = false;
  }
}

function initModals() {
  // Bug report
  document.getElementById('desk-bug-report').addEventListener('click', () => openModal('desk-bug-backdrop'));
  document.getElementById('desk-bug-close').addEventListener('click', () => closeModal('desk-bug-backdrop'));
  document.getElementById('desk-bug-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitReport({
      formId: 'desk-bug-form', descId: 'desk-bug-description',
      submitId: 'desk-bug-submit', statusId: 'desk-bug-status',
      backdropId: 'desk-bug-backdrop', kind: 'bug',
    });
  });

  // Feedback
  document.getElementById('desk-feedback').addEventListener('click', () => openModal('desk-feedback-backdrop'));
  document.getElementById('desk-feedback-close').addEventListener('click', () => closeModal('desk-feedback-backdrop'));
  document.getElementById('desk-feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitReport({
      formId: 'desk-feedback-form', descId: 'desk-feedback-description',
      submitId: 'desk-feedback-submit', statusId: 'desk-feedback-status',
      backdropId: 'desk-feedback-backdrop', kind: 'feedback',
    });
  });

  // Close on backdrop click
  document.getElementById('desk-bug-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('desk-bug-backdrop');
  });
  document.getElementById('desk-feedback-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('desk-feedback-backdrop');
  });
}

function init() {
  if (!isTauri()) return; // safety net — only meaningful inside Tauri

  document.getElementById('desk-new').addEventListener('click', newCircuit);
  document.getElementById('desk-open').addEventListener('click', openDialog);
  document.getElementById('desk-resume').addEventListener('click', gotoSimulator);
  document.getElementById('desk-clear-recents').addEventListener('click', () => {
    clearRecentFiles();
    renderRecents();
  });

  initModals();
  renderRecents();
}

init();
