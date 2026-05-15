// ── 74Sim Constants ──────────────────────────────────────────────────────────

export const GRID = {
  HOLE_SPACING: 20,        // px between hole centers
  HOLE_RADIUS: 3,          // px radius of each hole
  COLS: 63,                // columns per breadboard tile
  ROWS_PER_HALF: 5,        // rows per half (A-E or F-J)
  CHANNEL_GAP: 60,         // px gap for center channel (3 hole-spacings; 2 phantom rows)
  POWER_RAIL_HEIGHT: 20,   // px height of each power rail row
  POWER_RAIL_GAP: 40,      // gap between power rail and main grid (must be a multiple of HOLE_SPACING so all holes align on the same grid)
  TILE_PADDING: 40,        // px padding around each tile
};

// Derived dimensions for one breadboard tile
GRID.TILE_WIDTH = (GRID.COLS - 1) * GRID.HOLE_SPACING + GRID.TILE_PADDING * 2;
GRID.HALF_HEIGHT = (GRID.ROWS_PER_HALF - 1) * GRID.HOLE_SPACING;
GRID.TILE_HEIGHT =
  GRID.TILE_PADDING * 2 +
  GRID.POWER_RAIL_HEIGHT + GRID.POWER_RAIL_GAP +   // top rail
  GRID.HALF_HEIGHT +                                 // top half (A-E)
  GRID.CHANNEL_GAP +                                // center channel
  GRID.HALF_HEIGHT +                                 // bottom half (F-J)
  GRID.POWER_RAIL_GAP + GRID.POWER_RAIL_HEIGHT;     // bottom rail

// Default number of tiles
export const BOARD = {
  TILES_X: 2,
  TILES_Y: 2,
};

// Row labels
export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Colors (B&W theme)
export const COLORS = {
  BG: '#1a1a1a',
  BOARD_BG: '#2a2a2a',
  BOARD_BORDER: '#444',
  HOLE: '#555',
  HOLE_HOVER: '#aaa',
  HOLE_OCCUPIED: '#888',
  CHANNEL: '#1a1a1a',
  POWER_PLUS: '#666',
  POWER_MINUS: '#444',
  POWER_PLUS_MARK: '#999',
  POWER_MINUS_MARK: '#777',
  CHIP_BODY: '#111',
  CHIP_TEXT: '#ddd',
  CHIP_PIN: '#999',
  CHIP_NOTCH: '#555',
  COMPONENT_BODY: '#333',
  COMPONENT_TEXT: '#ffffff',
  WIRE_ENDPOINT: '#fff',
  TEXT: '#ffffff',
  TEXT_DIM: '#777',
  SELECTION: '#fff',
  INVALID: '#ff4444',
  GRID_LINE: '#2f2f2f',
  TOOLBAR_BG: '#111',
  TOOLBAR_TEXT: '#ffffff',
  TOOLBAR_HOVER: '#333',
  PANEL_BG: '#1e1e1e',
  PANEL_BORDER: '#444',
};

// Realistic board color theme (physical breadboard aesthetic)
export const REALISTIC_COLORS = {
  BG: '#2e2e24',
  BOARD_BG: '#f5f0e8',         // cream/white plastic body
  BOARD_BORDER: '#c8bfac',
  BOARD_SHADOW: '#9e9484',
  HOLE: '#1a1408',             // dark through-hole
  HOLE_RIM: '#a09080',         // metallic rim around hole
  HOLE_HOVER: '#444',
  HOLE_OCCUPIED: '#2c2014',
  CHANNEL: '#d4c9b5',          // lighter gap between halves
  POWER_RAIL_BG_PLUS: '#fff0f0', // red-tinted rail strip
  POWER_RAIL_BG_MINUS: '#eef0ff', // blue-tinted rail strip
  POWER_PLUS: '#cc2222',        // deep red hole
  POWER_MINUS: '#2244bb',       // deep blue hole
  POWER_PLUS_MARK: '#cc2222',
  POWER_MINUS_MARK: '#2244bb',
  CHIP_BODY: '#0d0d0d',         // near-black DIP IC
  CHIP_BODY_EDGE: '#333',
  CHIP_TEXT: '#d4d0c8',
  CHIP_PIN: '#b8a878',          // gold/silvery pins
  CHIP_NOTCH: '#2a2a2a',
  COMPONENT_BODY: '#c8b090',
  COMPONENT_TEXT: '#222',
  WIRE_ENDPOINT: '#fff',
  TEXT: '#3a3020',
  TEXT_DIM: '#9a9080',
  SELECTION: '#fff',
  INVALID: '#ff4444',
  GRID_LINE: '#e0d8c8',
  // Row label / col number ink
  LABEL_INK: '#6a5c44',
};
// Component types
export const COMP = {
  CHIP: 'chip',
  LED: 'led',
  SEVEN_SEG: 'seven_seg',
  BUTTON: 'button',
  PUSH_BUTTON: 'push_button',
  SWITCH: 'switch',
  SLIDE_SWITCH: 'slide_switch',
  RESISTOR: 'resistor',
  CAPACITOR: 'capacitor',
  POLARIZED_CAPACITOR: 'polarized_capacitor',
  DIODE: 'diode',
  CLOCK: 'clock',
};

// Interaction modes
export const MODE = {
  IDLE: 'idle',
  PLACE_CHIP: 'place_chip',
  PLACE_OUTPUT: 'place_output',
  PLACE_INPUT: 'place_input',
  PLACE_RESISTOR: 'place_resistor',
  WIRE_START: 'wire_start',
  WIRE_END: 'wire_end',
  // Two-click component placement (like wires)
  COMP_START: 'comp_start',
  COMP_END: 'comp_end',
  // Drag-to-move an already-placed component
  MOVE_COMP: 'move_comp',
  // Drag one endpoint of an existing wire to a new hole
  MOVE_WIRE_EP: 'move_wire_ep',
  // Drag one pin of a wire-like 2-pin component to a new hole
  MOVE_COMP_EP: 'move_comp_ep',
};

// Max distance (in grid squares) for wire-like 2-pin components
export const COMP_MAX_DIST = {
  [COMP.RESISTOR]: 17,
  [COMP.BUTTON]: 5,
  [COMP.PUSH_BUTTON]: 6,
  [COMP.SWITCH]: 10,
  [COMP.LED]: 8,
  [COMP.CAPACITOR]: 17,
  [COMP.POLARIZED_CAPACITOR]: 17,
  [COMP.DIODE]: 8,
};

// ── Drive-strength model for chip output pins ──────────────────────────────
// Used by the simulator to properly model floating nodes, pull up/pull down
// resistors, tri-state outputs, and open-collector outputs.
export const DRIVE = {
  PUSH_PULL: 'push_pull',   // Normal totem-pole output: drives HIGH or LOW
  HIGH_Z:    'high_z',      // High-impedance: pin disconnected (tri-state off, OC off)
  SINK_ONLY: 'sink_only',   // Open-collector active: can only sink current to GND
};

// Chip output impedance (Ω) limits max source/sink current to ~7 mA (5 V / 714 Ω)
// matching 74xx/74HCT output drive capability (enough to power an LED directly).
export const CHIP_R_OUT = 714;

// Weak internal pull up for undriven TTL inputs (Ω) causes floating inputs
// to read HIGH, matching real TTL behavior
export const TTL_INPUT_R_PULLUP = 100000; // 100kΩ

// ── 74 series family specs ─────────────────────────────────────────────────
// Each family defines the input thresholds, output impedance, floating input
// behavior, fan-out limit, and max clock frequency used by the simulator and
// warnings builder. VTH is the internal HIGH/LOW switching threshold.
export const FAMILY_SPEC = {
  LS:  { label: '74LS',  VIH: 2.0, VIL: 0.8, VTH: 1.4, R_OUT: 714, TTL_PULLUP: 100000, MAX_FREQ_HZ: 35e6, MAX_FANOUT: 10, FLOAT_HIGH: true  },
  HC:  { label: '74HC',  VIH: 3.5, VIL: 1.5, VTH: 2.5, R_OUT: 150, TTL_PULLUP: null,   MAX_FREQ_HZ: 25e6, MAX_FANOUT: 50, FLOAT_HIGH: false },
  HCT: { label: '74HCT', VIH: 2.0, VIL: 0.8, VTH: 1.4, R_OUT: 150, TTL_PULLUP: null,   MAX_FREQ_HZ: 25e6, MAX_FANOUT: 50, FLOAT_HIGH: false },
};
export const DEFAULT_FAMILY = 'LS';
export const getFamilySpec = (key) => FAMILY_SPEC[key] || FAMILY_SPEC.LS;

// Snap tolerance (px) for clicking on a hole
export const SNAP_RADIUS = 12;

// Random wire colors for endpoint circles (dark-board / normal mode)
export const WIRE_COLORS = [
  '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e84393', '#00cec9', '#fdcb6e',
  '#6c5ce7', '#ff7675', '#74b9ff', '#55efc4', '#ffeaa7',
];

// Wire colors for realistic mode all deep/saturated so they read clearly
// against the cream (#f5f0e8) breadboard surface. Light yellows and pastels excluded.
export const REALISTIC_WIRE_COLORS = [
  '#c62828', // deep red
  '#1565c0', // deep blue
  '#2e7d32', // deep green
  '#6a1b9a', // deep purple
  '#e65100', // deep orange
  '#00695c', // dark teal
  '#ad1457', // dark pink/magenta
  '#283593', // indigo
  '#827717', // dark olive/yellow saturated enough to distinguish from cream
  '#00838f', // dark cyan
  '#558b2f', // dark lime green
  '#5d4037', // brown
];
