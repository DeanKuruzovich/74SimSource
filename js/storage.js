// ── Storage: Save / Load ─────────────────────────────────────────────────────
// Serializes and deserializes the complete board state to/from JSON.
// Supports localStorage auto-save, browser file export/import, and (when
// running inside Tauri) native filesystem Save/Open + on-disk autosave.

import { deserializeComponent, setNextComponentId } from './components.js';
import { COMP } from './constants.js';

const STORAGE_KEY = '74sim_state';

// ── Tauri detection / invoke helper ──────────────────────────────────────────
export function isTauri() {
  return !!(globalThis.__TAURI_INTERNALS__ || globalThis.__TAURI__);
}

function tauriInvoke(cmd, args) {
  const t = globalThis.__TAURI__;
  if (!t || !t.core || !t.core.invoke) {
    return Promise.reject(new Error('Tauri runtime not available'));
  }
  return t.core.invoke(cmd, args);
}

export function saveToLocalStorage(state) {
  try {
    const data = serializeState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return null;
  }
}

export function serializeState(state) {
  return {
    components: state.components.map(c => c.serialize()),
    wires: state.wireManager.serialize(),
    extraTiles: state.extraTiles || [],
    textBoxes: state.textBoxes || [],
    // User settings
    chipFamily: state.chipFamily,
    showNetPower: state.showNetPower,
    showSimpleChipNames: state.showSimpleChipNames,
    showRealisticBoard: state.showRealisticBoard,
    pureDigital: state.pureDigital,
    showLogicView: state.showLogicView,
    showCircuitInfo: state.showCircuitInfo,
    showValues: state.showValues,
    lastUsedChips: state.lastUsedChips || [],
    logicFormat: state.logicFormat,
  };
}

// `world` is needed to recover wire net numbers from breadboard connectivity.
export function deserializeState(data, state, world = null) {
  if (!data) return false;

  state.components = [];
  let maxId = 0;
  for (const d of (data.components || [])) {
    const comp = deserializeComponent(d);
    if (comp) {
      state.components.push(comp);
      if (comp.id > maxId) maxId = comp.id;
    }
  }
  setNextComponentId(maxId + 1);

  state.wireManager.deserialize(data.wires || [], world);

  state.extraTiles = data.extraTiles || [];
  state.textBoxes = data.textBoxes || [];

  // Restore user settings if present
  if (data.chipFamily !== undefined) state.chipFamily = data.chipFamily;
  if (data.showNetPower !== undefined) state.showNetPower = data.showNetPower;
  if (data.showSimpleChipNames !== undefined) state.showSimpleChipNames = data.showSimpleChipNames;
  if (data.showRealisticBoard !== undefined) state.showRealisticBoard = data.showRealisticBoard;
  if (data.pureDigital !== undefined) state.pureDigital = data.pureDigital;
  if (data.showLogicView !== undefined) state.showLogicView = data.showLogicView;
  if (data.showCircuitInfo !== undefined) state.showCircuitInfo = data.showCircuitInfo;
  if (data.showValues !== undefined) state.showValues = data.showValues;
  if (data.lastUsedChips !== undefined) state.lastUsedChips = data.lastUsedChips;
  if (data.logicFormat !== undefined) state.logicFormat = data.logicFormat;

  return true;
}

// ── Circuit Name Suggestion ───────────────────────────────────────────────────
// Priority: 7-segment > clock/555 > sequential logic > combinational logic
// Maximum 3 parts in any suggested name.

export function suggestCircuitName(components) {
  // Sequential gate type prefixes → reduced name
  const SEQ_PREFIXES = [
    ['TIMER_555', '555timer'],
    ['COUNTER',   'counter'],
    ['SHIFT_REG', 'shiftreg'],
    ['D_FF',      'flipflop'],
    ['JK_FF',     'jkflop'],
    ['D_LATCH',   'latch'],
    ['SR_FF',     'srlatch'],
    ['RAM',       'ram'],
  ];

  // Combinational gate type prefixes → reduced name (order matters: longer/more-specific first)
  const COMB_PREFIXES = [
    ['BCD_7SEG',    'decoder'],
    ['DECODER',     'decoder'],
    ['MUX',         'mux'],
    ['ENCODER',     'encoder'],
    ['COMPARATOR',  'comparator'],
    ['ADDER',       'adder'],
    ['TRANSCEIVER', 'transceiver'],
    ['AOI',         'aoi'],
    ['TRI_BUFFER',  'buffer'],
    ['TRI_NOT',     'buffer'],
    ['NAND',        'nand'],
    ['NOR',         'nor'],
    ['XNOR',        'xnor'],
    ['XOR',         'xor'],
    ['NOT',         'not'],
    ['AND',         'and'],
    ['OR',          'or'],
    ['BUFFER',      'buffer'],
  ];

  function classifyGate(gateType) {
    for (const [prefix, name] of SEQ_PREFIXES) {
      if (gateType.startsWith(prefix)) return { kind: 'seq', name };
    }
    for (const [prefix, name] of COMB_PREFIXES) {
      if (gateType.startsWith(prefix)) return { kind: 'comb', name };
    }
    return null;
  }

  let hasSevenseg = false;
  let hasClock = false;
  const seqNames = [];
  const combNames = [];

  for (const comp of components) {
    if (comp.type === COMP.SEVEN_SEG) {
      hasSevenseg = true;
    } else if (comp.type === COMP.CLOCK) {
      hasClock = true;
    } else if (comp.type === COMP.CHIP && comp.chipDef) {
      for (const gate of (comp.chipDef.gates || [])) {
        const cat = classifyGate(gate.type || '');
        if (cat) {
          const list = cat.kind === 'seq' ? seqNames : combNames;
          if (!list.includes(cat.name)) list.push(cat.name);
        }
      }
    }
  }

  const parts = [];
  if (hasSevenseg) parts.push('7segment');
  if (hasClock && parts.length < 3) parts.push('clock');
  for (const n of seqNames) { if (parts.length >= 3) break; parts.push(n); }
  for (const n of combNames) { if (parts.length >= 3) break; parts.push(n); }

  const base = parts.length > 0 ? parts.join('_') + '_circuit' : 'circuit';
  return base + '.json';
}

export async function exportToFile(state) {
  const data = serializeState(state);
  const json = JSON.stringify(data, null, 2);
  const suggestedName = suggestCircuitName(state.components || []);

  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: '74Sim Circuit File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // user cancelled
    }
  }

  // Fallback for browsers without File System Access API
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        callback(data);
      } catch (e) {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

// ── Project Cache ─────────────────────────────────────────────────────────────
// Each distinct working session gets a UUID. On structural changes the current
// state is upserted (overwritten) into a per-project slot in localStorage.
// The list acts as an ad-hoc multi-slot autosave one entry per project.

const PROJECTS_KEY = '74sim_projects';
const CURRENT_PROJECT_KEY = '74sim_current_project_id';

export function generateProjectId() {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export function getCurrentProjectId() {
  let id = localStorage.getItem(CURRENT_PROJECT_KEY);
  if (!id) {
    id = generateProjectId();
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  }
  return id;
}

export function setCurrentProjectId(id) {
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

/** Upsert the current circuit state into the project cache. */
export function saveProjectSnapshot(state, projectId, name) {
  try {
    const projects = _readProjectList();
    const idx = projects.findIndex(p => p.id === projectId);
    const entry = {
      id: projectId,
      name: name || 'circuit',
      timestamp: Date.now(),
      componentCount: (state.components || []).filter(c => c.placed).length,
      state: serializeState(state),
    };
    if (idx !== -1) {
      projects[idx] = entry;
    } else {
      projects.push(entry);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save project snapshot:', e);
  }
}

/** Returns list of { id, name, timestamp, componentCount } sorted newest-first (no state blob). */
export function getProjectCache() {
  return _readProjectList()
    .map(({ id, name, timestamp, componentCount }) => ({ id, name, timestamp, componentCount }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

/** Returns the full saved entry (including state) for the given id, or null. */
export function loadProjectById(id) {
  return _readProjectList().find(p => p.id === id) || null;
}

/** Remove a project from the cache by id. */
export function deleteProjectFromCache(id) {
  try {
    const projects = _readProjectList().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to delete project from cache:', e);
  }
}

function _readProjectList() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

// ── Tauri filesystem Save / Open ─────────────────────────────────────────────
// "Save" / "Open" target real files on disk via native dialogs.
// "Import" / "Export" remain the browser-style download/upload functions above.

const CURRENT_FILE_KEY = '74sim_current_file_path';
const RECENT_FILES_KEY = '74sim_recent_files';
const RECENT_FILES_LIMIT = 10;

export function getCurrentFilePath() {
  try { return localStorage.getItem(CURRENT_FILE_KEY) || null; } catch { return null; }
}

export function setCurrentFilePath(path) {
  try {
    if (path) localStorage.setItem(CURRENT_FILE_KEY, path);
    else localStorage.removeItem(CURRENT_FILE_KEY);
  } catch {}
}

export function getRecentFiles() {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function pushRecentFile(path) {
  if (!path) return;
  try {
    const list = getRecentFiles().filter(p => p !== path);
    list.unshift(path);
    while (list.length > RECENT_FILES_LIMIT) list.pop();
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(list));
  } catch {}
}

export function clearRecentFiles() {
  try { localStorage.removeItem(RECENT_FILES_KEY); } catch {}
}

export async function basenameOf(path) {
  if (!path) return '';
  if (isTauri()) {
    try { return await tauriInvoke('path_basename', { path }); }
    catch {}
  }
  // Cheap JS fallback (handles both / and \).
  return String(path).replace(/^.*[\\/]/, '');
}

/** Pick a save target via native dialog. Returns the absolute path or null. */
export async function tauriPickSavePath(defaultName) {
  if (!isTauri()) return null;
  return await tauriInvoke('pick_save_path', { defaultName: defaultName || null });
}

/** Pick a file to open via native dialog. Returns the absolute path or null. */
export async function tauriPickOpenPath() {
  if (!isTauri()) return null;
  return await tauriInvoke('pick_open_path');
}

/**
 * Save to a known path on disk. If `path` is null, prompt for a Save As target.
 * Returns the path that was written, or null if the user cancelled.
 */
export async function saveStateToFile(state, path = null) {
  if (!isTauri()) return null;
  let target = path;
  if (!target) {
    target = await tauriPickSavePath(suggestCircuitName(state.components || []));
    if (!target) return null;
  }
  const json = JSON.stringify(serializeState(state), null, 2);
  await tauriInvoke('write_text_file', { path: target, contents: json });
  pushRecentFile(target);
  return target;
}

/**
 * Open a circuit from disk. If `path` is null, prompt via the native dialog.
 * Returns `{ path, data }` or null if the user cancelled.
 */
export async function openStateFromFile(path = null) {
  if (!isTauri()) return null;
  let target = path;
  if (!target) {
    target = await tauriPickOpenPath();
    if (!target) return null;
  }
  const raw = await tauriInvoke('read_text_file', { path: target });
  const data = JSON.parse(raw);
  pushRecentFile(target);
  return { path: target, data };
}

// ── Filesystem autosave ──────────────────────────────────────────────────────
// When the circuit is bound to a file path, autosave writes back to that file.
// Otherwise it writes a recovery autosave.json in the OS app-data dir so a
// fresh launch can still recover an unsaved circuit.

const AUTOSAVE_SETTING_KEY = '74sim_autosave_enabled';

export function isAutosaveEnabled() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_SETTING_KEY);
    if (raw === null) return true; // default ON
    return raw === '1';
  } catch { return true; }
}

export function setAutosaveEnabled(enabled) {
  try { localStorage.setItem(AUTOSAVE_SETTING_KEY, enabled ? '1' : '0'); } catch {}
}

// Status listeners. Status is one of: 'pending' | 'saving' | 'saved' | 'error' | 'idle'.
const _autosaveListeners = new Set();
export function onAutosaveStatus(cb) {
  _autosaveListeners.add(cb);
  return () => _autosaveListeners.delete(cb);
}
export function emitAutosaveStatus(status, error) {
  for (const cb of _autosaveListeners) {
    try { cb(status, error); } catch {}
  }
}

let _fsAutosaveTimer = null;
let _fsAutosaveSeq = 0;
// `targetPath`: when truthy, autosave writes to this exact path (the user's
// opened file). When falsy, falls back to the recovery autosave.json.
export function scheduleFsAutosave(state, targetPath = null) {
  if (!isTauri() || !isAutosaveEnabled()) return;
  clearTimeout(_fsAutosaveTimer);
  emitAutosaveStatus('pending');
  const seq = ++_fsAutosaveSeq;
  _fsAutosaveTimer = setTimeout(async () => {
    if (seq !== _fsAutosaveSeq) return; // a newer schedule superseded us
    emitAutosaveStatus('saving');
    try {
      const path = targetPath || await tauriInvoke('autosave_path');
      const json = JSON.stringify(serializeState(state), null, 2);
      await tauriInvoke('write_text_file', { path, contents: json });
      if (seq === _fsAutosaveSeq) emitAutosaveStatus('saved');
    } catch (e) {
      console.warn('FS autosave failed:', e);
      if (seq === _fsAutosaveSeq) emitAutosaveStatus('error', e);
    }
  }, 800);
}

export async function loadFsAutosave() {
  if (!isTauri()) return null;
  try {
    const path = await tauriInvoke('autosave_path');
    const raw = await tauriInvoke('read_text_file', { path });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
