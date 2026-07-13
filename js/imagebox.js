// ── Image Box Manager ─────────────────────────────────────────────────────────
// Manages floating image annotation boxes overlaid on the canvas, sibling of
// TextBoxManager (textbox.js). Boxes live in WORLD coordinates and move/scale
// with the board as you pan/zoom.
//
// The image always letterboxes inside the box (object-fit: contain) — dropping
// a huge image never grows the box. A lock button near the top-right corner
// toggles aspect-ratio lock: while locked, corner-resizing keeps the image's
// natural width:height ratio.
//
// Ways to load an image: "Select image" button (file picker), "Paste image"
// button / Ctrl+V while selected, drag-and-drop a file onto the box, or
// double-click to reopen the file picker.

import { t } from './i18n.js';

const MIN_W = 40;
const MIN_H = 30;
// Images larger than this are downscaled before storing, so the data-URL
// stays small enough for localStorage (whole-state budget is ~5 MB).
const MAX_STORED_DIM = 1200;

export class ImageBoxManager {
  constructor(layer, onChanged, onBeforeDelete) {
    this.layer     = layer;      // DOM element: #imagebox-layer
    this.onChanged = onChanged;  // callback when boxes change (for save)
    this.onBeforeDelete = onBeforeDelete; // callback to push undo before delete

    this._nextId   = 1;
    this._boxes    = new Map();  // id → { el, data, content, lockBtn }
    this._selected = null;
    this._dragging = false;
    this._resizing = false;
    this._pendingEntry = null;   // box waiting on the file picker

    // Current viewport state (kept in sync via updateViewport)
    this._zoom    = 1;
    this._offsetX = 50;
    this._offsetY = 50;

    // One hidden file input shared by every box
    this._fileInput = document.createElement('input');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    document.body.appendChild(this._fileInput);
    this._fileInput.addEventListener('change', () => {
      const file = this._fileInput.files && this._fileInput.files[0];
      const entry = this._pendingEntry;
      this._fileInput.value = '';
      this._pendingEntry = null;
      if (file && entry && this._boxes.has(entry.data.id)) {
        this._setImageFromBlob(entry, file);
      }
    });

    // Deselect when clicking outside any image box
    document.addEventListener('mousedown', e => {
      if (this._selected && !e.target.closest('.imagebox')) {
        this._deselect();
      }
    }, true);

    // Keyboard shortcuts (Delete to remove, Escape to deselect)
    document.addEventListener('keydown', e => {
      if (!this._selected) return;
      const a = document.activeElement;
      if (a && (a.isContentEditable || a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this._deleteSelected();
      } else if (e.key === 'Escape') {
        this._deselect();
      }
    });

    // Ctrl+V / Cmd+V pastes an image into the selected box
    document.addEventListener('paste', e => {
      if (!this._selected) return;
      const a = document.activeElement;
      if (a && (a.isContentEditable || a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            this._setImageFromBlob(this._selected, file);
          }
          return;
        }
      }
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Called every frame after the canvas draw — same contract as TextBoxManager. */
  updateViewport(offsetX, offsetY, zoom) {
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._zoom    = zoom;
    this.layer.style.transformOrigin = '0 0';
    this.layer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
  }

  /** Add a new empty image box centred in the current viewport. */
  addBox() {
    const rect = this.layer.getBoundingClientRect();
    const cx = (rect.width  / 2 - this._offsetX) / this._zoom;
    const cy = (rect.height / 2 - this._offsetY) / this._zoom;
    // World size that looks ~320×240 px on screen at current zoom
    const ww = Math.round(320 / this._zoom);
    const wh = Math.round(240 / this._zoom);
    const data = {
      id: this._nextId++,
      x: Math.round(cx - ww / 2),
      y: Math.round(cy - wh / 2),
      w: ww, h: wh,
      src: '',        // data-URL once an image is loaded
      natW: 0, natH: 0, // natural size of the stored image
      lock: true,     // aspect-ratio lock (on by default)
      v: 1,
    };
    this._createEl(data);
    this.onChanged();
  }

  /** Serialize all boxes to plain-object array. */
  serialize() {
    return [...this._boxes.values()].map(({ data }) => ({ ...data, v: 1 }));
  }

  /** Load boxes from a serialized array, replacing any existing boxes. */
  deserialize(arr) {
    this.clear();
    if (!arr || !arr.length) return;
    let maxId = 0;
    for (const d of arr) {
      this._createEl({ ...d });
      if (d.id > maxId) maxId = d.id;
    }
    this._nextId = maxId + 1;
    // Don't auto-select when restoring saved boxes
    if (this._selected) {
      this._selected.el.classList.remove('selected');
      this._selected = null;
    }
  }

  /** Remove all boxes from the DOM. */
  clear() {
    for (const { el } of this._boxes.values()) el.remove();
    this._boxes.clear();
    this._selected = null;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _applyWorldGeometry(el, data) {
    el.style.left   = data.x + 'px';
    el.style.top    = data.y + 'px';
    el.style.width  = data.w + 'px';
    el.style.height = data.h + 'px';
  }

  _createEl(data) {
    const el = document.createElement('div');
    el.className = 'imagebox';

    const content = document.createElement('div');
    content.className = 'imagebox-content';
    el.appendChild(content);

    // Top bar: aspect-ratio lock toggle
    const bar = document.createElement('div');
    bar.className = 'imagebox-bar';
    const lockBtn = document.createElement('button');
    lockBtn.className = 'imagebox-lock';
    lockBtn.type = 'button';
    bar.appendChild(lockBtn);
    el.appendChild(bar);

    // Four corner resize handles
    for (const dir of ['nw', 'ne', 'sw', 'se']) {
      const h = document.createElement('div');
      h.className = `imagebox-handle imagebox-handle-${dir}`;
      h.dataset.dir = dir;
      el.appendChild(h);
    }

    this.layer.appendChild(el);

    const entry = { el, data, content, lockBtn };
    this._boxes.set(data.id, entry);

    this._applyWorldGeometry(el, data);
    this._renderContent(entry);
    this._updateLockBtn(entry);
    this._bindEvents(entry);

    // Auto-select the newly created box
    this._select(entry);
  }

  /** Fill the content area: the image if set, otherwise the load-image placeholder. */
  _renderContent(entry) {
    const { content, data } = entry;
    content.innerHTML = '';

    if (data.src) {
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = '';
      img.draggable = false;
      content.appendChild(img);
      return;
    }

    const ph = document.createElement('div');
    ph.className = 'imagebox-placeholder';

    const selectBtn = document.createElement('button');
    selectBtn.className = 'imagebox-btn';
    selectBtn.type = 'button';
    selectBtn.textContent = t('imageBox.select', { def: 'Select image' });
    selectBtn.addEventListener('click', () => this._openFilePicker(entry));

    const pasteBtn = document.createElement('button');
    pasteBtn.className = 'imagebox-btn';
    pasteBtn.type = 'button';
    pasteBtn.textContent = t('imageBox.paste', { def: 'Paste image' });
    pasteBtn.addEventListener('click', () => this._pasteFromClipboard(entry));

    const hint = document.createElement('div');
    hint.className = 'imagebox-hint';
    hint.textContent = t('imageBox.dropHint', { def: 'or drag an image here' });

    ph.appendChild(selectBtn);
    ph.appendChild(pasteBtn);
    ph.appendChild(hint);
    content.appendChild(ph);
    entry.hint = hint;
  }

  _updateLockBtn(entry) {
    const { lockBtn, data } = entry;
    lockBtn.textContent = data.lock ? '\u{1F512}' : '\u{1F513}'; // 🔒 / 🔓
    lockBtn.classList.toggle('locked', !!data.lock);
    lockBtn.title = data.lock
      ? t('imageBox.unlockAspect', { def: 'Aspect ratio locked — click to unlock' })
      : t('imageBox.lockAspect',   { def: 'Aspect ratio unlocked — click to lock' });
  }

  _openFilePicker(entry) {
    this._pendingEntry = entry;
    this._fileInput.click();
  }

  async _pasteFromClipboard(entry) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(tp => tp.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          this._setImageFromBlob(entry, blob);
          return;
        }
      }
      this._flashHint(entry, t('imageBox.noClipImage', { def: 'No image on the clipboard' }));
    } catch (err) {
      // Clipboard API unavailable or permission denied — Ctrl+V still works
      console.warn('Clipboard read failed:', err);
      this._flashHint(entry, t('imageBox.pasteFallback', { def: 'Press Ctrl+V (Cmd+V) to paste' }));
    }
  }

  _flashHint(entry, msg) {
    if (!entry.hint) return;
    const original = t('imageBox.dropHint', { def: 'or drag an image here' });
    entry.hint.textContent = msg;
    setTimeout(() => {
      if (entry.hint && this._boxes.has(entry.data.id)) entry.hint.textContent = original;
    }, 2500);
  }

  async _setImageFromBlob(entry, blob) {
    if (!blob || !blob.type.startsWith('image/')) return;
    let info;
    try {
      info = await this._processImage(blob);
    } catch (err) {
      console.warn('Failed to load image:', err);
      this._flashHint(entry, t('imageBox.loadFailed', { def: "Couldn't load that image" }));
      return;
    }
    entry.data.src  = info.src;
    entry.data.natW = info.natW;
    entry.data.natH = info.natH;
    // Fit the box to the image's aspect ratio without ever growing it
    if (entry.data.lock) this._fitToRatio(entry.data);
    this._applyWorldGeometry(entry.el, entry.data);
    this._renderContent(entry);
    this.onChanged();
  }

  /** Read a blob into a data-URL, downscaling big images so the stored state
   * stays within localStorage budget. Returns { src, natW, natH }. */
  _processImage(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('decode failed'));
        img.onload = () => {
          const natW = img.naturalWidth  || img.width  || 300;
          const natH = img.naturalHeight || img.height || 150;
          const src  = reader.result;
          if (natW <= MAX_STORED_DIM && natH <= MAX_STORED_DIM && src.length <= 700_000) {
            resolve({ src, natW, natH });
            return;
          }
          const scale = Math.min(1, MAX_STORED_DIM / Math.max(natW, natH));
          const w = Math.max(1, Math.round(natW * scale));
          const h = Math.max(1, Math.round(natH * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          // Keep PNG only if the image actually uses transparency; JPEG is far smaller
          let hasAlpha = false;
          try {
            const px = ctx.getImageData(0, 0, w, h).data;
            for (let i = 3; i < px.length; i += 16) {
              if (px[i] < 255) { hasAlpha = true; break; }
            }
          } catch { hasAlpha = true; }
          resolve({
            src: hasAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85),
            natW: w, natH: h,
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(blob);
    });
  }

  /** Shrink (never grow) the box to the image's natural aspect ratio, keeping
   * the box centre fixed. */
  _fitToRatio(data) {
    if (!data.natW || !data.natH) return;
    const ratio = data.natW / data.natH;
    let w = data.w, h = data.w / ratio;
    if (h > data.h) { h = data.h; w = h * ratio; }
    w = Math.max(MIN_W, Math.round(w));
    h = Math.max(MIN_H, Math.round(h));
    data.x = Math.round(data.x + (data.w - w) / 2);
    data.y = Math.round(data.y + (data.h - h) / 2);
    data.w = w; data.h = h;
  }

  _bindEvents(entry) {
    const { el, data } = entry;

    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;

      // Corner handle → resize
      if (e.target.dataset && e.target.dataset.dir) {
        e.preventDefault();
        e.stopPropagation();
        this._select(entry);
        this._startResize(e, entry, e.target.dataset.dir);
        return;
      }

      this._select(entry);

      // Buttons handle their own clicks — don't start a drag over them
      if (e.target.closest('.imagebox-btn, .imagebox-lock')) return;

      e.preventDefault();
      this._startDrag(e, entry);
    });

    // Double-click → (re)open the file picker
    el.addEventListener('dblclick', e => {
      if (e.target.dataset && e.target.dataset.dir) return;
      if (e.target.closest('.imagebox-btn, .imagebox-lock')) return;
      this._openFilePicker(entry);
    });

    entry.lockBtn.addEventListener('click', e => {
      e.stopPropagation();
      data.lock = !data.lock;
      if (data.lock && data.src) {
        this._fitToRatio(data);
        this._applyWorldGeometry(el, data);
      }
      this._updateLockBtn(entry);
      this.onChanged();
    });

    // Drag & drop an image file onto the box (sets or replaces the image)
    el.addEventListener('dragover', e => {
      if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        el.classList.add('dragover');
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('dragover'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        this._select(entry);
        this._setImageFromBlob(entry, file);
      }
    });
  }

  _select(entry) {
    if (this._selected === entry) return;
    if (this._selected) this._selected.el.classList.remove('selected');
    this._selected = entry;
    entry.el.classList.add('selected');
  }

  _deselect() {
    if (!this._selected) return;
    this._selected.el.classList.remove('selected');
    this._selected = null;
  }

  _delete(id) {
    const entry = this._boxes.get(id);
    if (!entry) return;
    if (this._selected === entry) this._selected = null;
    entry.el.remove();
    this._boxes.delete(id);
    this.onChanged();
  }

  _deleteSelected() {
    if (this._selected) {
      this.onBeforeDelete?.();
      this._delete(this._selected.data.id);
    }
  }

  _startDrag(e, entry) {
    const { data, el } = entry;
    let lastX = e.clientX;
    let lastY = e.clientY;
    this._dragging = true;

    const onMove = mv => {
      if (!this._dragging) return;
      data.x += (mv.clientX - lastX) / this._zoom;
      data.y += (mv.clientY - lastY) / this._zoom;
      lastX = mv.clientX;
      lastY = mv.clientY;
      this._applyWorldGeometry(el, data);
    };

    const onUp = () => {
      this._dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.onChanged();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  _startResize(e, entry, dir) {
    const { data, el } = entry;
    const startX = e.clientX;
    const startY = e.clientY;
    const orig   = { x: data.x, y: data.y, w: data.w, h: data.h };
    // While locked, resizing keeps the image's natural ratio (or the box's
    // current ratio if no image is loaded yet)
    const ratio = data.lock
      ? (data.natW && data.natH ? data.natW / data.natH : orig.w / orig.h)
      : null;
    this._resizing = true;

    const onMove = mv => {
      if (!this._resizing) return;
      const dx = (mv.clientX - startX) / this._zoom;
      const dy = (mv.clientY - startY) / this._zoom;
      let { x, y, w, h } = orig;

      if (dir.includes('e')) w = orig.w + dx;
      if (dir.includes('w')) w = orig.w - dx;
      if (dir.includes('s')) h = orig.h + dy;
      if (dir.includes('n')) h = orig.h - dy;
      w = Math.max(MIN_W, w);
      h = Math.max(MIN_H, h);

      if (ratio) {
        // Follow whichever axis the user has pulled further; derive the other
        if (Math.abs(w / orig.w - 1) >= Math.abs(h / orig.h - 1)) h = w / ratio;
        else w = h * ratio;
        if (w < MIN_W) { w = MIN_W; h = w / ratio; }
        if (h < MIN_H) { h = MIN_H; w = h * ratio; }
      }

      if (dir.includes('w')) x = orig.x + orig.w - w;
      if (dir.includes('n')) y = orig.y + orig.h - h;

      data.x = x; data.y = y; data.w = w; data.h = h;
      this._applyWorldGeometry(el, data);
    };

    const onUp = () => {
      this._resizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.onChanged();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
