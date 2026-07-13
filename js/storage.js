// ── Storage: Save / Load ─────────────────────────────────────────────────────
// Serializes and deserializes the complete board state to/from JSON.
// Supports localStorage auto-save and file export/import.

import { deserializeComponent, setNextComponentId } from './components.js';
import { COMP } from './constants.js';

const STORAGE_KEY = '74sim_state';
const FILENAME_KEY = '74sim_current_filename';

// Sticky filename: once the user saves with a chosen name, or loads a file,
// that name overrides the auto-suggested name for subsequent saves until the
// user clears the circuit.
export function getStoredFilename() {
  try {
    return localStorage.getItem(FILENAME_KEY) || null;
  } catch (_) {
    return null;
  }
}

export function setStoredFilename(name) {
  try {
    if (!name) return;
    const trimmed = String(name).trim();
    if (!trimmed) return;
    localStorage.setItem(FILENAME_KEY, trimmed);
  } catch (_) { /* ignore */ }
}

export function clearStoredFilename() {
  try {
    localStorage.removeItem(FILENAME_KEY);
  } catch (_) { /* ignore */ }
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
    imageBoxes: state.imageBoxes || [],
    // User settings
    chipFamily: state.chipFamily,
    showNetPower: state.showNetPower,
    showSimpleChipNames: state.showSimpleChipNames,
    showRealisticBoard: state.showRealisticBoard,
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
  state.imageBoxes = data.imageBoxes || [];

  // Restore user settings if present
  if (data.chipFamily !== undefined) state.chipFamily = data.chipFamily;
  if (data.showNetPower !== undefined) state.showNetPower = data.showNetPower;
  if (data.showSimpleChipNames !== undefined) state.showSimpleChipNames = data.showSimpleChipNames;
  if (data.showRealisticBoard !== undefined) state.showRealisticBoard = data.showRealisticBoard;
  if (data.showLogicView !== undefined) state.showLogicView = data.showLogicView;
  if (data.showCircuitInfo !== undefined) state.showCircuitInfo = data.showCircuitInfo;
  if (data.showValues !== undefined) state.showValues = data.showValues;
  if (data.lastUsedChips !== undefined) state.lastUsedChips = data.lastUsedChips;
  if (data.logicFormat !== undefined) state.logicFormat = data.logicFormat;

  return true;
}

// ── Circuit Name Suggestion ───────────────────────────────────────────────────
// Priority: 7 segment > clock/555 > sequential logic > combinational logic
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
  // Stored (sticky) filename takes priority over the auto-suggested one.
  const suggestedName = getStoredFilename() || suggestCircuitName(state.components || []);

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
      setStoredFilename(fileHandle.name || suggestedName);
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
  setStoredFilename(suggestedName);
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
        callback(data, file.name);
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
