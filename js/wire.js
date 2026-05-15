// ── Wire System ──────────────────────────────────────────────────────────────
// Wires connect two breadboard holes. Instead of routing visible traces,
// each endpoint gets a colored circle with a net number.
// Same number = same net. Right-click to change a single endpoint's number.

import { WIRE_COLORS, REALISTIC_WIRE_COLORS } from './constants.js';

let nextWireNum = 0;

export function resetWireCounter() {
  nextWireNum = 0;
}

export function setWireCounter(n) {
  nextWireNum = n;
}

export function getNextWireNum() {
  return nextWireNum;
}

function randomWireColor(realistic = false) {
  const palette = realistic ? REALISTIC_WIRE_COLORS : WIRE_COLORS;
  return palette[Math.floor(Math.random() * palette.length)];
}

// A wire is a connection between two hole IDs with a shared net number + color
export class Wire {
  constructor(startHoleId, endHoleId, netNum = null, realistic = false) {
    this.id = Wire._nextId++;
    this.startHoleId = startHoleId;
    this.endHoleId = endHoleId;
    // Net number (the displayed number)
    if (netNum !== null) {
      this.startNet = netNum;
      this.endNet = netNum;
    } else {
      this.startNet = nextWireNum;
      this.endNet = nextWireNum;
      nextWireNum++;
    }
    this.color = randomWireColor(realistic);
  }

  // Change net number of just one endpoint
  setStartNet(n) { this.startNet = n; }
  setEndNet(n) { this.endNet = n; }

  serialize() {
    return {
      id: this.id,
      startHoleId: this.startHoleId,
      endHoleId: this.endHoleId,
      color: this.color,
    };
  }
}

Wire._nextId = 1;

// ── Wire Manager ─────────────────────────────────────────────────────────────

export class WireManager {
  constructor() {
    this.wires = [];
  }

  addWire(startHoleId, endHoleId, realistic = false) {
    const wire = new Wire(startHoleId, endHoleId, null, realistic);
    this.wires.push(wire);
    return wire;
  }

  // Smart add: reuse net number & color if either endpoint shares a
  // breadboard strip (same tile, same col, same half for main) with an existing
  // wire endpoint. Power-rail endpoints are intentionally skipped because the
  // entire VCC (or GND) bus counts as one strip propagating via power-rail
  // matches would give the same net number to unrelated main-grid column strips
  // that merely happen to share the same rail, making both sides of a component
  // (resistor, LED, switch...) appear to be on the same net.
  addWireSmart(startHoleId, endHoleId, world, realistic = false) {
    // Only match on main-grid holes, not power-rail holes.
    const startIsPower = startHoleId.split(':')[2] === 'power';
    const endIsPower   = endHoleId.split(':')[2] === 'power';

    // Find existing net/color for each endpoint
    const existingStart = startIsPower ? null : this._findExistingNet(startHoleId, world);
    const existingEnd   = endIsPower   ? null : this._findExistingNet(endHoleId,   world);

    // Pick the net to reuse (prefer start, then end, then new)
    const reuse = existingStart || existingEnd;
    if (reuse) {
      const wire = new Wire(startHoleId, endHoleId, reuse.net);
      wire.color = reuse.color;
      this.wires.push(wire);
      // Also update the other endpoint's net if the other side has a different existing net
      if (existingStart && existingEnd && existingStart.net !== existingEnd.net) {
        // Merge: change all endpoints with existingEnd.net to existingStart.net/color
        const oldNet = existingEnd.net;
        const newNet = existingStart.net;
        const newColor = existingStart.color;
        for (const w of this.wires) {
          if (w.startNet === oldNet) { w.startNet = newNet; w.color = newColor; }
          if (w.endNet === oldNet) { w.endNet = newNet; w.color = newColor; }
        }
      } else if (reuse) {
        // Ensure both endpoints share the same net/color
        wire.startNet = reuse.net;
        wire.endNet = reuse.net;
        wire.color = reuse.color;
      }
      return wire;
    }

    // No existing connections create new wire with new net
    const wire = new Wire(startHoleId, endHoleId, null, realistic);
    this.wires.push(wire);
    return wire;
  }

  // Find an existing wire endpoint that shares a breadboard strip with the given hole
  _findExistingNet(holeId, world) {
    for (const w of this.wires) {
      if (world.areConnected(holeId, w.startHoleId)) {
        return { net: w.startNet, color: w.color };
      }
      if (world.areConnected(holeId, w.endHoleId)) {
        return { net: w.endNet, color: w.color };
      }
    }
    return null;
  }

  removeWire(wireId) {
    this.wires = this.wires.filter(w => w.id !== wireId);
  }

  // Find all wires touching a given hole
  getWiresAtHole(holeId) {
    return this.wires.filter(w => w.startHoleId === holeId || w.endHoleId === holeId);
  }

  // Find the wire endpoint at a specific hole
  // Returns { wire, endpoint: 'start'|'end' } or null
  findEndpointAtHole(holeId) {
    for (const w of this.wires) {
      if (w.startHoleId === holeId) return { wire: w, endpoint: 'start' };
      if (w.endHoleId === holeId) return { wire: w, endpoint: 'end' };
    }
    return null;
  }

  // Get all unique net numbers in use
  getNetNumbers() {
    const nodes = new Set();
    for (const w of this.wires) {
      nodes.add(w.startNet);
      nodes.add(w.endNet);
    }
    return [...nodes].sort((a, b) => a - b);
  }

  // Get all hole IDs connected to a given net number
  getHolesInNet(netNum) {
    const holes = new Set();
    for (const w of this.wires) {
      if (w.startNet === netNum) holes.add(w.startHoleId);
      if (w.endNet === netNum) holes.add(w.endHoleId);
    }
    return [...holes];
  }

  clear() {
    this.wires = [];
  }

  serialize() {
    return this.wires.map(w => w.serialize());
  }

  // Net numbers are not persisted - they're recovered from breadboard
  // connectivity. Wires whose endpoints share a strip get the same net,
  // matching what addWireSmart would produce when placed interactively.
  deserialize(data, world = null) {
    this.wires = [];
    nextWireNum = 0;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      let netNum = null;
      if (world) {
        const startIsPower = d.startHoleId.split(':')[2] === 'power';
        const endIsPower   = d.endHoleId.split(':')[2] === 'power';
        const existingStart = startIsPower ? null : this._findExistingNet(d.startHoleId, world);
        const existingEnd   = endIsPower   ? null : this._findExistingNet(d.endHoleId,   world);
        if (existingStart && existingEnd && existingStart.net !== existingEnd.net) {
          // Bridging two previously-distinct nets → renumber the second to the first.
          const oldNet = existingEnd.net;
          const newNet = existingStart.net;
          for (const w of this.wires) {
            if (w.startNet === oldNet) w.startNet = newNet;
            if (w.endNet === oldNet) w.endNet = newNet;
          }
          netNum = newNet;
        } else if (existingStart) {
          netNum = existingStart.net;
        } else if (existingEnd) {
          netNum = existingEnd.net;
        }
      }
      const w = new Wire(d.startHoleId, d.endHoleId, netNum);
      w.id = d.id ?? (i + 1);
      if (d.color) w.color = d.color;
      this.wires.push(w);
    }
    Wire._nextId = Math.max(0, ...this.wires.map(w => w.id)) + 1;
  }
}
