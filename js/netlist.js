// ── Netlist Builder ──────────────────────────────────────────────────────────
// Traverses wires + breadboard internal connections to build a set of nodes.
// Each net is a set of connected hole IDs + the component pins attached.
// 2-pin components (resistors, LEDs, buttons, switches) act as NET BOUNDARIES 
// their pins are on separate nodes. Closed switches/pressed buttons are
// recorded in `conductingPairs` so the simulator can bridge their nets with
// a low-resistance stamp (voltage conducts, but VCC/GND identity does not).

import { COMP } from './constants.js';
import { parseHoleId } from './breadboard.js';

export class Netlist {
  constructor() {
    this.nodes = [];  // Array of { id, holes: Set<holeId>, pins: [{comp, pin}], isVCC, isGND }
    this.conductingPairs = [];  // [{ comp, holeA, holeB }] closed switches/pressed buttons
  }

  // Build the netlist from the current state
  build(world, components, wireManager) {
    const adj = new Map(); // holeId → Set<holeId>
    this.conductingPairs = [];

    const addEdge = (a, b) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a).add(b);
      adj.get(b).add(a);
    };

    // Collect all holes that are occupied by components
    const occupiedHoles = new Set();
    const holeToPins = new Map(); // holeId → [{ comp, pin }]

    // Build a set of hole pairs that belong to the same 2-pin component
    // and should NOT be connected (component acts as net boundary)
    const componentBoundaryPairs = new Set(); // "holeA|holeB" strings

    const addBoundary = (a, b) => {
      componentBoundaryPairs.add(a + '|' + b);
      componentBoundaryPairs.add(b + '|' + a);
    };

    for (const comp of components) {
      if (!comp.placed) continue;
      for (const pin of comp.pins) {
        occupiedHoles.add(pin.holeId);
        if (!holeToPins.has(pin.holeId)) holeToPins.set(pin.holeId, []);
        holeToPins.get(pin.holeId).push({ comp, pin });
      }

      // 2-pin switch: net boundary. When closed, recorded as a conducting pair
      // so the simulator can conduct voltage across without merging rail identity.
      if (comp.type === COMP.SWITCH && comp.pins.length === 2) {
        const h0 = comp.pins[0].holeId;
        const h1 = comp.pins[1].holeId;
        addBoundary(h0, h1);
        if (comp.on) this.conductingPairs.push({ comp, holeA: h0, holeB: h1 });
      } else if (comp.pins.length === 2 && comp.type !== COMP.PUSH_BUTTON) {
        // Resistor, LED, diode, capacitor, etc. always net boundary
        addBoundary(comp.pins[0].holeId, comp.pins[1].holeId);
      }

      // 4-pin tactile button: vertical pairs (TL↔BL, TR↔BR) are physically the
      // same terminal (always merged). Horizontal (TL↔TR) is the switched path:
      // conducting pair only when pressed voltage conducts across without
      // propagating VCC/GND identity.
      if (comp.type === COMP.BUTTON && comp.pins.length === 4) {
        const hTL = comp.pins[0].holeId;
        const hTR = comp.pins[1].holeId;
        const hBL = comp.pins[2].holeId;
        const hBR = comp.pins[3].holeId;
        addEdge(hTL, hBL);
        addEdge(hTR, hBR);
        if (comp.pressed) {
          this.conductingPairs.push({ comp, holeA: hTL, holeB: hTR });
        }
      }

      // 2-pin push button: net boundary always; conducting pair when pressed.
      if (comp.type === COMP.PUSH_BUTTON && comp.pins.length === 2) {
        const h0 = comp.pins[0].holeId;
        const h1 = comp.pins[1].holeId;
        addBoundary(h0, h1);
        if (comp.pressed) this.conductingPairs.push({ comp, holeA: h0, holeB: h1 });
      }

      // 3-pin slide switch: all three pin-pairs are net boundaries; the active
      // pair (per state) is recorded as a conducting pair.
      if (comp.type === COMP.SLIDE_SWITCH && comp.pins.length === 3) {
        const h0 = comp.pins[0].holeId; // pin 1
        const h1 = comp.pins[1].holeId; // pin 2 (center)
        const h2 = comp.pins[2].holeId; // pin 3
        addBoundary(h0, h1);
        addBoundary(h1, h2);
        addBoundary(h0, h2);
        if (comp.state === 0) {
          this.conductingPairs.push({ comp, holeA: h0, holeB: h1 });
        } else if (comp.state === 2) {
          this.conductingPairs.push({ comp, holeA: h1, holeB: h2 });
        }
      }
    }

    // Add wire connections: group by net number
    const netGroups = new Map(); // netNum → [holeId]
    for (const wire of wireManager.wires) {
      if (!netGroups.has(wire.startNet)) netGroups.set(wire.startNet, []);
      netGroups.get(wire.startNet).push(wire.startHoleId);
      if (!netGroups.has(wire.endNet)) netGroups.set(wire.endNet, []);
      netGroups.get(wire.endNet).push(wire.endHoleId);
    }

    // Connect all holes in the same net group
    for (const [netNum, holes] of netGroups) {
      for (let i = 0; i < holes.length; i++) {
        for (let j = i + 1; j < holes.length; j++) {
          addEdge(holes[i], holes[j]);
        }
        if (!adj.has(holes[i])) adj.set(holes[i], new Set());
      }
    }

    // Add breadboard internal connections for all occupied holes & wire holes
    const allHoles = new Set([...occupiedHoles]);
    for (const wire of wireManager.wires) {
      allHoles.add(wire.startHoleId);
      allHoles.add(wire.endHoleId);
    }

    for (const holeId of allHoles) {
      const connected = world.getConnectedHoles(holeId);
      for (const neighbor of connected) {
        // Only add edge if the neighbor is also in our tracked set
        if (!allHoles.has(neighbor)) continue;
        // Skip if this edge crosses a component boundary
        if (componentBoundaryPairs.has(holeId + '|' + neighbor)) continue;
        addEdge(holeId, neighbor);
      }
      if (!adj.has(holeId)) adj.set(holeId, new Set());
    }

    // Step 2: BFS to find connected components (nodes)
    const visited = new Set();
    this.nodes = [];
    let netId = 0;

    for (const holeId of adj.keys()) {
      if (visited.has(holeId)) continue;
      const net = { id: netId++, holes: new Set(), pins: [], isVCC: false, isGND: false };
      const queue = [holeId];
      while (queue.length > 0) {
        const h = queue.pop();
        if (visited.has(h)) continue;
        visited.add(h);
        net.holes.add(h);

        // Add component pins at this hole
        const pins = holeToPins.get(h);
        if (pins) {
          net.pins.push(...pins);
        }

        // Check if this hole is a power rail
        const parsed = parseHoleId(h);
        if (parsed.type === 'power') {
          if (parsed.row === 1 || parsed.row === 3) net.isVCC = true;
          if (parsed.row === 0 || parsed.row === 2) net.isGND = true;
        }

        // Traverse neighbors
        const neighbors = adj.get(h);
        if (neighbors) {
          for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
          }
        }
      }
      if (net.pins.length > 0 || net.holes.size > 0) {
        this.nodes.push(net);
      }
    }

    return this.nodes;
  }

  // Find the net containing a specific hole
  findNetByHole(holeId) {
    return this.nodes.find(n => n.holes.has(holeId)) || null;
  }

  // Find the net containing a specific component pin
  findNetByPin(comp, pinName) {
    for (const net of this.nodes) {
      for (const p of net.pins) {
        if (p.comp.id === comp.id && p.pin.name === pinName) return net;
      }
    }
    return null;
  }

  // Check if connecting two holes would create a VCC-GND short.
  // Note: only checks rail tags and direct breadboard neighbors does not
  // traverse closed switches/buttons (those don't propagate rail identity).
  wouldShort(holeA, holeB, world) {
    const netA = this.findNetByHole(holeA);
    const netB = this.findNetByHole(holeB);

    const parsedA = parseHoleId(holeA);
    const parsedB = parseHoleId(holeB);

    let aVCC = netA ? netA.isVCC : false;
    let aGND = netA ? netA.isGND : false;
    let bVCC = netB ? netB.isVCC : false;
    let bGND = netB ? netB.isGND : false;

    if (parsedA.type === 'power') {
      if (parsedA.row === 1 || parsedA.row === 3) aVCC = true;
      if (parsedA.row === 0 || parsedA.row === 2) aGND = true;
    }
    if (parsedB.type === 'power') {
      if (parsedB.row === 1 || parsedB.row === 3) bVCC = true;
      if (parsedB.row === 0 || parsedB.row === 2) bGND = true;
    }

    // Check breadboard-connected holes too
    const connA = world.getConnectedHoles(holeA);
    for (const ch of connA) {
      const p = parseHoleId(ch);
      if (p.type === 'power') {
        if (p.row === 1 || p.row === 3) aVCC = true;
        if (p.row === 0 || p.row === 2) aGND = true;
      }
    }
    const connB = world.getConnectedHoles(holeB);
    for (const ch of connB) {
      const p = parseHoleId(ch);
      if (p.type === 'power') {
        if (p.row === 1 || p.row === 3) bVCC = true;
        if (p.row === 0 || p.row === 2) bGND = true;
      }
    }

    return (aVCC && bGND) || (aGND && bVCC) || (aVCC && aGND) || (bVCC && bGND);
  }

  // Get all input components (buttons, switches) and their net connections
  getInputs() {
    const inputs = [];
    for (const net of this.nodes) {
      for (const p of net.pins) {
        if (p.comp.type === COMP.BUTTON || p.comp.type === COMP.PUSH_BUTTON || p.comp.type === COMP.SWITCH) {
          inputs.push({ comp: p.comp, pin: p.pin, net });
        }
      }
    }
    return inputs;
  }

  // Get all output components (LEDs, 7-segs)
  getOutputs() {
    const outputs = [];
    for (const net of this.nodes) {
      for (const p of net.pins) {
        if (p.comp.type === COMP.LED || p.comp.type === COMP.SEVEN_SEG) {
          outputs.push({ comp: p.comp, pin: p.pin, net });
        }
      }
    }
    return outputs;
  }

  // Get all chip pins connected to each net
  getChipConnections() {
    const connections = [];
    for (const net of this.nodes) {
      const chipPins = net.pins.filter(p => p.comp.type === COMP.CHIP);
      if (chipPins.length > 0) {
        connections.push({ net, chipPins });
      }
    }
    return connections;
  }
}
