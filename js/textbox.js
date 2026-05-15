// ── Text Box Manager ──────────────────────────────────────────────────────────
// Manages floating text annotation boxes overlaid on the canvas.
// Boxes live in WORLD coordinates and move/scale with the board as you pan/zoom.
// Single-click selects, double-click enters text-edit mode, body-drag to move.

export class TextBoxManager {
  constructor(layer, onChanged) {
    this.layer    = layer;      // DOM element: #textbox-layer
    this.onChanged = onChanged; // callback when boxes change (for save)

    this._nextId  = 1;
    this._boxes   = new Map();  // id → { el, data, content }
    this._selected = null;      // currently selected entry
    this._editing  = false;     // whether we're in text-edit mode
    this._dragging  = false;
    this._resizing  = false;

    // Current viewport state (kept in sync via updateViewport)
    this._zoom    = 1;
    this._offsetX = 50;
    this._offsetY = 50;

    // Deselect when clicking outside any text box
    document.addEventListener('mousedown', e => {
      if (this._selected && !e.target.closest('.textbox')) {
        this._deselect();
      }
    }, true);

    // Keyboard shortcuts (Delete to remove, Escape to deselect / exit edit)
    document.addEventListener('keydown', e => {
      if (this._editing && e.key === 'Escape') {
        this._exitEdit();
        return;
      }
      if (this._selected && !this._editing) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          this._deleteSelected();
        } else if (e.key === 'Escape') {
          this._deselect();
        }
      }
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Called every frame after the canvas draw.
   * Applies a single CSS transform to the layer so all textboxes pan/zoom
   * with the canvas as one rigid group geometry, text, borders, handles
   * all scale together identically to canvas-drawn components.
   */
  updateViewport(offsetX, offsetY, zoom) {
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._zoom    = zoom;
    this.layer.style.transformOrigin = '0 0';
    this.layer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
  }

  /** Add a new text box centred in the current viewport (world coordinates). */
  addBox() {
    const rect = this.layer.getBoundingClientRect();
    // Centre of visible viewport in world units
    const cx = (rect.width  / 2 - this._offsetX) / this._zoom;
    const cy = (rect.height / 2 - this._offsetY) / this._zoom;
    // World size that looks ~240×120 px on screen at current zoom
    const ww = Math.round(240 / this._zoom);
    const wh = Math.round(120 / this._zoom);
    const data = {
      id: this._nextId++,
      x: Math.round(cx - ww / 2),
      y: Math.round(cy - wh / 2),
      w: ww, h: wh,
      text: '',
      v: 2,
    };
    this._createEl(data);
    this.onChanged();
  }

  /** Serialize all boxes to plain-object array. */
  serialize() {
    return [...this._boxes.values()].map(({ data }) => ({ ...data, v: 2 }));
  }

  /** Load boxes from a serialized array, replacing any existing boxes. */
  deserialize(arr) {
    this.clear();
    if (!arr || !arr.length) return;
    let maxId = 0;
    for (const d of arr) {
      const data = { ...d };
      // v<2 saves stored screen-pixel coords (default pan=50, zoom=1) migrate
      if (!d.v || d.v < 2) {
        data.x = d.x - 50;
        data.y = d.y - 50;
        data.v = 2;
      }
      this._createEl(data);
      if (data.id > maxId) maxId = data.id;
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
    this._editing  = false;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  /** Position/size a textbox element directly in world coordinates.
   * The parent #textbox-layer carries the pan/zoom transform, so children
   * just live in unscaled world space. */
  _applyWorldGeometry(el, data) {
    el.style.left   = data.x + 'px';
    el.style.top    = data.y + 'px';
    el.style.width  = data.w + 'px';
    el.style.height = data.h + 'px';
  }

  _createEl(data) {
    const el = document.createElement('div');
    el.className = 'textbox';

    // Editable content area
    const content = document.createElement('div');
    content.className = 'textbox-content';
    content.contentEditable = 'false';
    content.innerHTML = data.text || '';
    el.appendChild(content);

    // Four corner resize handles
    for (const dir of ['nw', 'ne', 'sw', 'se']) {
      const h = document.createElement('div');
      h.className = `textbox-handle textbox-handle-${dir}`;
      h.dataset.dir = dir;
      el.appendChild(h);
    }

    this.layer.appendChild(el);

    const entry = { el, data, content };
    this._boxes.set(data.id, entry);

    // Place in world coordinates; layer transform handles pan/zoom.
    this._applyWorldGeometry(el, data);

    this._bindEvents(entry);

    // Auto-select the newly created box and enter edit mode
    this._select(entry);
    setTimeout(() => {
      if (this._selected === entry) this._enterEdit(entry);
    }, 50);
  }

  _bindEvents(entry) {
    const { el, data, content } = entry;

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

      // Select the box
      this._select(entry);

      // Drag the box body when not in text-edit mode
      if (!this._editing) {
        e.preventDefault();
        this._startDrag(e, entry);
      }
    });

    // Double-click → enter edit mode (single click just selects / drags)
    el.addEventListener('dblclick', e => {
      if (e.target.dataset && e.target.dataset.dir) return;
      this._select(entry);
      this._enterEdit(entry);
    });

    // Content changes persist text
    content.addEventListener('input', () => {
      data.text = content.innerHTML;
      this.onChanged();
    });

    // Blur exit editing when focus leaves the box
    content.addEventListener('blur', () => {
      setTimeout(() => {
        if (this._editing && this._selected === entry && !el.contains(document.activeElement)) {
          this._exitEdit();
        }
      }, 0);
    });
  }

  _select(entry) {
    if (this._selected === entry) return;
    if (this._selected) {
      this._exitEdit();
      this._selected.el.classList.remove('selected');
    }
    this._selected = entry;
    entry.el.classList.add('selected');
  }

  _deselect() {
    if (!this._selected) return;
    this._exitEdit();
    this._selected.el.classList.remove('selected');
    this._selected = null;
  }

  _enterEdit(entry) {
    if (this._editing && this._selected === entry) return;
    this._editing = true;
    entry.content.contentEditable = 'true';
    entry.el.classList.add('editing');
    entry.content.focus();
    // Place cursor at end of text
    const range = document.createRange();
    range.selectNodeContents(entry.content);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  _exitEdit() {
    if (!this._editing || !this._selected) return;
    this._editing = false;
    this._selected.content.contentEditable = 'false';
    this._selected.el.classList.remove('editing');
    this._selected.content.blur();
  }

  _delete(id) {
    const entry = this._boxes.get(id);
    if (!entry) return;
    if (this._selected === entry) {
      this._selected = null;
      this._editing  = false;
    }
    entry.el.remove();
    this._boxes.delete(id);
    this.onChanged();
  }

  _deleteSelected() {
    if (this._selected) this._delete(this._selected.data.id);
  }

  _startDrag(e, entry) {
    const { data, el } = entry;
    let lastX = e.clientX;
    let lastY = e.clientY;
    this._dragging = true;

    const onMove = mv => {
      if (!this._dragging) return;
      // Convert screen-pixel delta to world-unit delta using current zoom
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
    // Minimum size in world units (≈60×40 px on screen at zoom=1)
    const MIN_W = 60;
    const MIN_H = 40;
    this._resizing = true;

    const onMove = mv => {
      if (!this._resizing) return;
      // Convert screen delta to world delta
      const dx = (mv.clientX - startX) / this._zoom;
      const dy = (mv.clientY - startY) / this._zoom;
      let { x, y, w, h } = orig;

      if (dir.includes('e')) w = Math.max(MIN_W, w + dx);
      if (dir.includes('s')) h = Math.max(MIN_H, h + dy);
      if (dir.includes('w')) { w = Math.max(MIN_W, w - dx); x = orig.x + orig.w - w; }
      if (dir.includes('n')) { h = Math.max(MIN_H, h - dy); y = orig.y + orig.h - h; }

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
