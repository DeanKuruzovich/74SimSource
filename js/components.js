// ── Component Classes ─────────────────────────────────────────────────────────
// Data models for all placeable components: chips, LEDs, 7-seg displays,
// buttons, switches, resistors.

import { COMP } from './constants.js';
import { getChipDef, getChipColSpan } from './chips.js';
import { holeId } from './breadboard.js';

let nextComponentId = 1;

export function resetComponentIds() {
  nextComponentId = 1;
}

export function setNextComponentId(id) {
  nextComponentId = id;
}

// ── Base Component ───────────────────────────────────────────────────────────

class Component {
  constructor(type, name) {
    this.id = nextComponentId++;
    this.type = type;
    this.name = name;
    // Placement: which tile and which column/row the component's anchor is at
    this.tileX = 0;
    this.tileY = 0;
    this.col = 0;   // breadboard column of the anchor (pin 1 position)
    this.row = 0;   // breadboard row of the anchor
    this.placed = false;
    this.pins = []; // Array of { pinIndex, holeId, name, type }
  }

  // Subclasses override to compute pin hole mappings after placement
  computePins() {}

  place(tileX, tileY, col, row) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.col = col;
    this.row = row;
    this.placed = true;
    this.computePins();
  }

  // Get all hole IDs occupied by this component
  getOccupiedHoles() {
    return this.pins.map(p => p.holeId);
  }

  // Find a pin by name (common helper used by simulator drive state resolution)
  getPinByName(name) {
    return this.pins.find(p => p.name === name);
  }

  // Whether this component's anchor (col, row) may legally land on `row`.
  // Used by the drag-to-move drop validator to enforce per-component shape
  // constraints (e.g. chips straddle the channel, horizontal buttons cannot).
  // Default: any main-grid row is fine.
  isValidAnchor(row) {
    return row >= 0 && row <= 9;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      tileX: this.tileX,
      tileY: this.tileY,
      col: this.col,
      row: this.row,
    };
  }
}

// ── Chip Component ───────────────────────────────────────────────────────────
// DIP package straddling the center channel, notch on the LEFT side.
// Standard orientation: VCC (pin N) at top-left, GND (pin N/2) at bottom-right.
//
// Physical breadboard layout (top-down view, notch left):
//   Top row  (row 4, E): pin N, N-1, ... N/2+1  (left → right)
//   Bottom row(row 5, F): pin 1,  2, ...   N/2  (left → right)
//
// So for a 14-pin DIP:
//   Top:    VCC(14) 13 12 11 10 9 8
//   Bottom:  1A(1)   2  3  4  5 6 GND(7)

export class ChipComponent extends Component {
  constructor(chipId) {
    const def = getChipDef(chipId);
    super(COMP.CHIP, def ? def.name : chipId);
    this.chipId = chipId;
    this.chipDef = def;
    this.colSpan = def ? def.pins / 2 : 7;
    // Sequential state for flip-flops and latches.
    this.ffState = new Map();
    // Sequential state for memory devices like the 7489.
    this.ramState = null;
    // Per-chip family override (null = use project default)
    this.chipFamily = null;
  }

  computePins() {
    if (!this.chipDef) return;
    const half = this.chipDef.pins / 2;
    this.pins = [];
    for (let i = 0; i < this.chipDef.pins; i++) {
      let pinDefIndex, col, row;
      if (i < half) {
        // Top row: pins N down to N/2+1, left to right → VCC at top-left
        pinDefIndex = this.chipDef.pins - 1 - i;
        col = this.col + i;
        row = 4; // Row E (bottom of top half)
      } else {
        // Bottom row: pins 1 up to N/2, left to right → GND at bottom-right
        pinDefIndex = i - half;
        col = this.col + (i - half);
        row = 5; // Row F (top of bottom half)
      }
      const pinDef = this.chipDef.pinout[pinDefIndex];
      this.pins.push({
        pinIndex: pinDefIndex,
        pin: pinDef.pin,
        name: pinDef.name,
        type: pinDef.type,
        holeId: holeId(this.tileX, this.tileY, 'main', col, row),
        col,
        row,
      });
    }
  }

  // Get pin info by pin name
  getPinByName(name) {
    return this.pins.find(p => p.name === name);
  }

  // Get pin info by pin number (1-indexed)
  getPinByNumber(num) {
    return this.pins.find(p => p.pin === num);
  }

  // DIPs always straddle the channel: top-row pins on E (4), bottom on F (5).
  isValidAnchor(row) { return row === 4; }

  serialize() {
    const ffStateObj = this.ffState.size > 0 ? Object.fromEntries(this.ffState) : undefined;
    const ramStateObj = this.ramState
      ? { words: this.ramState.words.map(word => [...word]) }
      : undefined;
    return { ...super.serialize(), chipId: this.chipId, ffState: ffStateObj, ramState: ramStateObj, chipFamily: this.chipFamily || undefined };
  }
}

// ── LED Component ────────────────────────────────────────────────────────────
// 2 pins: anode and cathode, placed on any two holes (wire-like)

export class LEDComponent extends Component {
  constructor(color = 'red') {
    super(COMP.LED, 'LED');
    this.lit = false;
    this.color = color;
    this.startHoleId = null;
    this.endHoleId = null;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'Anode', type: 'input', holeId: this.startHoleId },
      { pinIndex: 1, name: 'Cathode', type: 'output', holeId: this.endHoleId },
    ];
  }

  serialize() {
    return { id: this.id, type: this.type, color: this.color, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── 7-Segment Display ────────────────────────────────────────────────────────
// 10 pins: a-g segments, dp, and 2 common pins
// Lays out as a DIP-like package spanning the channel

export class SevenSegComponent extends Component {
  constructor(commonAnode = true, displayName = '7-SEG') {
    super(COMP.SEVEN_SEG, displayName);
    this.segments = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 };
    this.commonAnode = commonAnode;
  }

  serialize() {
    return { ...super.serialize(), commonAnode: this.commonAnode };
  }

  computePins() {
    // 10-pin layout, 5 per side, straddling the channel like a DIP
    // Top row (row 2): indices 0-4 left to right → g, f, COM1, a, b
    // Bottom row (row 6): indices 5-9 right to left col-wise → dp, c, COM2, d, e
    const pinNames = [
      { name: 'g',    type: 'input' },    // pin 1  - top row, col+0
      { name: 'f',    type: 'input' },    // pin 2  - top row, col+1
      { name: 'COM1', type: 'power' },    // pin 3  - top row, col+2
      { name: 'a',    type: 'input' },    // pin 4  - top row, col+3
      { name: 'b',    type: 'input' },    // pin 5  - top row, col+4
      { name: 'dp',   type: 'input' },    // pin 6  - bottom row, col+4 (right)
      { name: 'c',    type: 'input' },    // pin 7  - bottom row, col+3
      { name: 'COM2', type: 'power' },    // pin 8  - bottom row, col+2
      { name: 'd',    type: 'input' },    // pin 9  - bottom row, col+1
      { name: 'e',    type: 'input' },    // pin 10 - bottom row, col+0 (left)
    ];
    this.pins = [];
    for (let i = 0; i < 10; i++) {
      let col, row;
      if (i < 5) {
        col = this.col + i;
        row = 2;
      } else {
        col = this.col + 4 - (i - 5);
        row = 6;
      }
      this.pins.push({
        pinIndex: i,
        pin: i + 1,
        name: pinNames[i].name,
        type: pinNames[i].type,
        holeId: holeId(this.tileX, this.tileY, 'main', col, row),
        col,
        row,
      });
    }
  }

  // Override to block all holes under the body (rows 2 6 × 5 cols)
  getOccupiedHoles() {
    const holes = [];
    for (let r = 2; r <= 6; r++) {
      for (let c = this.col; c <= this.col + 4; c++) {
        holes.push(holeId(this.tileX, this.tileY, 'main', c, r));
      }
    }
    return holes;
  }

  // Body straddles the channel; anchor row is fixed at 4.
  isValidAnchor(row) { return row === 4; }
}

// ── Button (Momentary, 4-pin Tactile) ────────────────────────────────────────
// Two orientations:
// Horizontal (vertical=false): 3 col gap × 2 row gap. colSpan=4.
//   TL=(col, row), TR=(col+3, row), BL=(col, row+2), BR=(col+3, row+2)
// Vertical (vertical=true): straddles channel. 1 col gap × 1 row gap. colSpan=2.
//   TL=(col, row), TR=(col+1, row), BL=(col, row+1), BR=(col+1, row+1)
//   (placed with row=4 so TL/TR on E, BL/BR on F, straddling the channel)
// Always: TL↔BL and TR↔BR constantly; TL↔TR when pressed.

export class ButtonComponent extends Component {
  constructor() {
    super(COMP.BUTTON, 'BTN');
    this.pressed = false;
    this.vertical = false;
    this.colSpan = 4;
  }

  computePins() {
    if (this.vertical) {
      // Rotated: col gap=2, row gap=1 (straddles E/F across channel)
      this.pins = [
        { pinIndex: 0, name: 'TL', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col,     this.row) },
        { pinIndex: 1, name: 'TR', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 2, this.row) },
        { pinIndex: 2, name: 'BL', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col,     this.row + 1) },
        { pinIndex: 3, name: 'BR', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 2, this.row + 1) },
      ];
    } else {
      // Normal: 3 wide × 2 tall (col gap=3, row gap=2)
      this.pins = [
        { pinIndex: 0, name: 'TL', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col,     this.row) },
        { pinIndex: 1, name: 'TR', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 3, this.row) },
        { pinIndex: 2, name: 'BL', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col,     this.row + 2) },
        { pinIndex: 3, name: 'BR', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 3, this.row + 2) },
      ];
    }
  }

  // Vertical orientation straddles the channel (row=4 only). Horizontal must
  // keep both pin rows inside one half: top half rows 0-2 (pins on r, r+2 ⊂ A-E)
  // or bottom half rows 5-7 (pins on r, r+2 ⊂ F-J).
  isValidAnchor(row) {
    if (this.vertical) return row === 4;
    return (row >= 0 && row <= 2) || (row >= 5 && row <= 7);
  }

  // The button body sits over the breadboard, not just the 4 terminal holes.
  // Horizontal footprint is 4 cols × 3 rows; block everything except the two
  // middle-row holes on the terminal columns (those share a column with TL/TR
  // or BL/BR so they're electrically equivalent   leaving them placeable lets
  // users tap the same net without overlapping the body).
  // Vertical footprint is 3 cols × 2 rows and straddles the channel; block the
  // full bounding box.
  getOccupiedHoles() {
    const holes = [];
    if (this.vertical) {
      for (let r = this.row; r <= this.row + 1; r++) {
        for (let c = this.col; c <= this.col + 2; c++) {
          holes.push(holeId(this.tileX, this.tileY, 'main', c, r));
        }
      }
    } else {
      for (let r = this.row; r <= this.row + 2; r++) {
        for (let c = this.col; c <= this.col + 3; c++) {
          if (r === this.row + 1 && (c === this.col || c === this.col + 3)) continue;
          holes.push(holeId(this.tileX, this.tileY, 'main', c, r));
        }
      }
    }
    return holes;
  }

  serialize() {
    return { ...super.serialize(), vertical: this.vertical };
  }
}

// Wire-like placement: click first hole then second hole (like resistor/LED).
// Open (not connected) by default; pressing bridges A↔B. Max span: 4 holes.

export class PushButtonComponent extends Component {
  constructor() {
    super(COMP.PUSH_BUTTON, 'PBTN');
    this.pressed = false;
    this.startHoleId = null;
    this.endHoleId = null;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'A', type: 'passive', holeId: this.startHoleId },
      { pinIndex: 1, name: 'B', type: 'passive', holeId: this.endHoleId },
    ];
  }

  serialize() {
    return { id: this.id, type: this.type, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── Switch (Toggle/Latching) ─────────────────────────────────────────────────
// 2 pins placed on any two holes (wire-like), toggles on click

export class SwitchComponent extends Component {
  constructor() {
    super(COMP.SWITCH, 'SW');
    this.on = false;
    this.startHoleId = null;
    this.endHoleId = null;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'A', type: 'input', holeId: this.startHoleId },
      { pinIndex: 1, name: 'B', type: 'output', holeId: this.endHoleId },
    ];
  }

  serialize() {
    return { id: this.id, type: this.type, on: this.on, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── Slide Switch (SPDT, 3-position) ──────────────────────────────────────────
// 3 pins placed at 3 consecutive holes (single-click chip-style placement).
// state: 0 = connect pin1 & pin2, 1 = open (all disconnected), 2 = connect pin2 & pin3

export class SlideSwitchComponent extends Component {
  constructor() {
    super(COMP.SLIDE_SWITCH, 'SPDT');
    this.state = 1; // default: open
  }

  computePins() {
    this.pins = [
      { pinIndex: 0, name: '1', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col,     this.row) },
      { pinIndex: 1, name: '2', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 1, this.row) },
      { pinIndex: 2, name: '3', type: 'passive', holeId: holeId(this.tileX, this.tileY, 'main', this.col + 2, this.row) },
    ];
  }

  nextState() {
    this.state = (this.state + 1) % 3;
  }

  serialize() {
    return { ...super.serialize(), state: this.state };
  }
}

// ── Clock Component ───────────────────────────────────────────────────────────
// Single-pin clock source. Drives its output HIGH then LOW at a set frequency.
// Assumed internally powered no VCC/GND connection required.

export class ClockComponent extends Component {
  constructor(frequencyHz = 1) {
    super(COMP.CLOCK, 'CLK');
    this.frequencyHz = frequencyHz;
    this.high = false; // current output state, updated by simulator
  }

  computePins() {
    this.pins = [
      { pinIndex: 0, name: 'OUT', type: 'output', holeId: holeId(this.tileX, this.tileY, 'main', this.col, this.row) },
    ];
  }

  serialize() {
    return { ...super.serialize(), frequencyHz: this.frequencyHz };
  }
}

// 2 pins placed on any two holes (wire-like). Click to change resistance.

export class ResistorComponent extends Component {
  constructor(resistance = 1000) {
    super(COMP.RESISTOR, 'R');
    this.resistance = resistance === 0 ? 0.01 : resistance; // ohms
    this.startHoleId = null;
    this.endHoleId = null;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'A', type: 'passive', holeId: this.startHoleId },
      { pinIndex: 1, name: 'B', type: 'passive', holeId: this.endHoleId },
    ];
  }

  setResistance(r) {
    this.resistance = r === 0 ? 0.01 : r;
  }

  getLabel() {
    if (this.resistance >= 1e6) return (this.resistance / 1e6).toFixed(1) + 'MΩ';
    if (this.resistance >= 1e3) return (this.resistance / 1e3).toFixed(1) + 'kΩ';
    return this.resistance + 'Ω';
  }

  serialize() {
    return { id: this.id, type: this.type, resistance: this.resistance, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── Capacitor Component ──────────────────────────────────────────────────────
// 2 pins placed on any two holes (wire-like). Click to change capacitance.

export class CapacitorComponent extends Component {
  constructor(capacitance = 100e-9) {
    super(COMP.CAPACITOR, 'C');
    this.capacitance = capacitance; // farads
    this.startHoleId = null;
    this.endHoleId = null;
    // Time-domain state: voltage across the capacitor at previous time step
    this.vPrev = 0;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'A', type: 'passive', holeId: this.startHoleId },
      { pinIndex: 1, name: 'B', type: 'passive', holeId: this.endHoleId },
    ];
  }

  setCapacitance(c) {
    this.capacitance = c;
  }

  getLabel() {
    if (this.capacitance >= 1e-3) return (this.capacitance * 1e3).toFixed(1) + 'mF';
    if (this.capacitance >= 1e-6) return (this.capacitance * 1e6).toFixed(1) + 'µF';
    if (this.capacitance >= 1e-9) return (this.capacitance * 1e9).toFixed(1) + 'nF';
    return (this.capacitance * 1e12).toFixed(1) + 'pF';
  }

  serialize() {
    return { id: this.id, type: this.type, capacitance: this.capacitance, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── Polarized Capacitor Component ───────────────────────────────────────────
// 2 pins placed on any two holes. Pin A (index 0) is the positive (+) lead.

export class PolarizedCapacitorComponent extends Component {
  constructor(capacitance = 10e-6) {
    super(COMP.POLARIZED_CAPACITOR, 'C');
    this.capacitance = capacitance; // farads
    this.startHoleId = null;
    this.endHoleId = null;
    this.vPrev = 0;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'A', type: 'passive', holeId: this.startHoleId },
      { pinIndex: 1, name: 'B', type: 'passive', holeId: this.endHoleId },
    ];
  }

  setCapacitance(c) {
    this.capacitance = c;
  }

  getLabel() {
    if (this.capacitance >= 1e-3) return (this.capacitance * 1e3).toFixed(1) + 'mF';
    if (this.capacitance >= 1e-6) return (this.capacitance * 1e6).toFixed(1) + 'µF';
    if (this.capacitance >= 1e-9) return (this.capacitance * 1e9).toFixed(1) + 'nF';
    return (this.capacitance * 1e12).toFixed(1) + 'pF';
  }

  serialize() {
    return { id: this.id, type: this.type, capacitance: this.capacitance, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

export class DiodeComponent extends Component {
  constructor() {
    super(COMP.DIODE, 'D');
    this.startHoleId = null;
    this.endHoleId = null;
  }

  placeWireLike(startHoleId, endHoleId) {
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    this.placed = true;
    this.computePins();
  }

  computePins() {
    if (!this.startHoleId || !this.endHoleId) return;
    this.pins = [
      { pinIndex: 0, name: 'Anode', type: 'input', holeId: this.startHoleId },
      { pinIndex: 1, name: 'Cathode', type: 'output', holeId: this.endHoleId },
    ];
  }

  getLabel() { return '1N4148'; }

  serialize() {
    return { id: this.id, type: this.type, startHoleId: this.startHoleId, endHoleId: this.endHoleId };
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createComponent(type, subtype) {
  switch (type) {
    case COMP.CHIP: return new ChipComponent(subtype);
    case COMP.LED: return new LEDComponent(subtype || 'red');
    case COMP.SEVEN_SEG: return subtype === '5161as' ? new SevenSegComponent(false, '5161AS') : new SevenSegComponent();
    case COMP.BUTTON: return new ButtonComponent();
    case COMP.PUSH_BUTTON: return new PushButtonComponent();
    case COMP.SWITCH: return new SwitchComponent();
    case COMP.SLIDE_SWITCH: return new SlideSwitchComponent();
    case COMP.RESISTOR: return new ResistorComponent();
    case COMP.CAPACITOR: return new CapacitorComponent();
    case COMP.POLARIZED_CAPACITOR: return new PolarizedCapacitorComponent();
    case COMP.DIODE: return new DiodeComponent();
    case COMP.CLOCK: return new ClockComponent();
    default: return null;
  }
}

// Deserialize
export function deserializeComponent(data) {
  let comp;
  switch (data.type) {
    case COMP.CHIP: {
      comp = new ChipComponent(data.chipId);
      if (data.ffState) {
        for (const [k, v] of Object.entries(data.ffState)) comp.ffState.set(k, v);
      }
      if (data.ramState?.words) {
        comp.ramState = { words: data.ramState.words.map(word => [...word]) };
      }
      if (data.chipFamily) comp.chipFamily = data.chipFamily;
      break;
    }
    case COMP.LED: comp = new LEDComponent(data.color || 'red'); break;
    case COMP.SEVEN_SEG: comp = new SevenSegComponent(data.commonAnode !== false, data.commonAnode === false ? '5161AS' : '7-SEG'); break;
    case COMP.BUTTON: comp = new ButtonComponent(); comp.vertical = data.vertical || false; if (comp.vertical) comp.colSpan = 3; break;
    case COMP.PUSH_BUTTON: comp = new PushButtonComponent(); break;
    case COMP.SWITCH: comp = new SwitchComponent(); comp.on = data.on || false; break;
    case COMP.SLIDE_SWITCH: comp = new SlideSwitchComponent(); comp.state = data.state ?? 1; break;
    case COMP.RESISTOR: comp = new ResistorComponent(data.resistance || 1000); break;
    case COMP.CAPACITOR: comp = new CapacitorComponent(data.capacitance || 100e-9); break;
    case COMP.POLARIZED_CAPACITOR: comp = new PolarizedCapacitorComponent(data.capacitance || 10e-6); break;
    case COMP.DIODE: comp = new DiodeComponent(); break;
    case COMP.CLOCK: comp = new ClockComponent(data.frequencyHz || 1); break;
    default: return null;
  }
  comp.id = data.id;
  // Wire-like 2-pin components
  if (data.startHoleId && data.endHoleId && comp.placeWireLike) {
    comp.placeWireLike(data.startHoleId, data.endHoleId);
  } else if (data.col !== undefined) {
    comp.place(data.tileX ?? 0, data.tileY ?? 0, data.col, data.row);
  }
  return comp;
}
