// ── Breadboard Model ─────────────────────────────────────────────────────────
// Each tile models a real breadboard: 63 columns, rows A-E (top) and F-J (bottom),
// center channel, and top/bottom power rails (+ and −).

import { GRID, ROW_LABELS, BOARD } from './constants.js';

// ── Hole ID encoding ─────────────────────────────────────────────────────────
// A hole is uniquely identified by: tileX, tileY, type, col, row
//   type: 'main' | 'power'
//   For main: col 0-62, row 0-9 (0-4 = top half A-E, 5-9 = bottom half F-J)
//   For power: col 0-62, row 0-3 (0 = top−, 1 = top+, 2 = bottom−, 3 = bottom+)

export function holeId(tileX, tileY, type, col, row) {
  return `${tileX}:${tileY}:${type}:${col}:${row}`;
}

export function parseHoleId(id) {
  const parts = id.split(':');
  return {
    tileX: parseInt(parts[0]),
    tileY: parseInt(parts[1]),
    type: parts[2],
    col: parseInt(parts[3]),
    row: parseInt(parts[4]),
  };
}

// ── Breadboard Tile ──────────────────────────────────────────────────────────

export class BreadboardTile {
  constructor(tileX, tileY) {
    this.tileX = tileX;
    this.tileY = tileY;
  }

  // Get the world-pixel origin (top-left corner) of this tile
  getOrigin() {
    return {
      x: this.tileX * GRID.TILE_WIDTH,
      y: this.tileY * GRID.TILE_HEIGHT,
    };
  }

  // Get world-pixel position of a main-grid hole (col 0-62, row 0-9)
  getMainHolePos(col, row) {
    const origin = this.getOrigin();
    const x = origin.x + GRID.TILE_PADDING + col * GRID.HOLE_SPACING;
    let y;
    if (row < 5) {
      // Top half A-E
      y = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT + GRID.POWER_RAIL_GAP + row * GRID.HOLE_SPACING;
    } else {
      // Bottom half F-J
      y = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT + GRID.POWER_RAIL_GAP +
        GRID.HALF_HEIGHT + GRID.CHANNEL_GAP + (row - 5) * GRID.HOLE_SPACING;
    }
    return { x, y };
  }

  // Get world-pixel position of a power rail hole (col 0-62, row 0-3)
  // row: 0=top−, 1=top+, 2=bottom−, 3=bottom+
  getPowerHolePos(col, row) {
    const origin = this.getOrigin();
    const x = origin.x + GRID.TILE_PADDING + col * GRID.HOLE_SPACING;
    let y;
    if (row === 0) {
      // Top − (outer)
      y = origin.y + GRID.TILE_PADDING;
    } else if (row === 1) {
      // Top + (inner)
      y = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT;
    } else if (row === 2) {
      // Bottom −
      y = origin.y + GRID.TILE_HEIGHT - GRID.TILE_PADDING - GRID.POWER_RAIL_HEIGHT;
    } else {
      // Bottom +
      y = origin.y + GRID.TILE_HEIGHT - GRID.TILE_PADDING;
    }
    return { x, y };
  }

  // Get world-pixel position of any hole by id components
  getHolePos(type, col, row) {
    if (type === 'main') return this.getMainHolePos(col, row);
    return this.getPowerHolePos(col, row);
  }
}

// ── Breadboard World ─────────────────────────────────────────────────────────

export class BreadboardWorld {
  constructor(tilesX = BOARD.TILES_X, tilesY = BOARD.TILES_Y) {
    this.tilesX = tilesX;
    this.tilesY = tilesY;
    this.tiles = [];
    this._initialTileSet = new Set();
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        this.tiles.push(new BreadboardTile(tx, ty));
        this._initialTileSet.add(`${tx}:${ty}`);
      }
    }
  }

  getTile(tx, ty) {
    return this.tiles.find(t => t.tileX === tx && t.tileY === ty);
  }

  isInitialTile(tx, ty) {
    return this._initialTileSet.has(`${tx}:${ty}`);
  }

  addTile(tx, ty) {
    if (this.getTile(tx, ty)) return false;
    this.tiles.push(new BreadboardTile(tx, ty));
    return true;
  }

  removeTile(tx, ty) {
    if (this.isInitialTile(tx, ty)) return false;
    const idx = this.tiles.findIndex(t => t.tileX === tx && t.tileY === ty);
    if (idx === -1) return false;
    this.tiles.splice(idx, 1);
    return true;
  }

  // Get world-pixel position for a hole id string
  getHolePosById(id) {
    const h = parseHoleId(id);
    const tile = this.getTile(h.tileX, h.tileY);
    if (!tile) return null;
    return tile.getHolePos(h.type, h.col, h.row);
  }

  // Find the nearest hole to a world-pixel position, within snapRadius
  findNearestHole(worldX, worldY, snapRadius) {
    let best = null;
    let bestDist = snapRadius;

    for (const tile of this.tiles) {
      // Main grid holes
      for (let col = 0; col < GRID.COLS; col++) {
        for (let row = 0; row < 10; row++) {
          const pos = tile.getMainHolePos(col, row);
          const dx = worldX - pos.x;
          const dy = worldY - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            best = {
              id: holeId(tile.tileX, tile.tileY, 'main', col, row),
              pos,
              tileX: tile.tileX,
              tileY: tile.tileY,
              type: 'main',
              col,
              row,
            };
          }
        }
      }
      // Power rail holes only physical holes (10 groups of 5, cols 2-6, 8-12, ..., 56-60)
      for (let col = 0; col < GRID.COLS; col++) {
        const oc = col - 2;
        if (oc < 0 || oc >= 59 || oc % 6 === 5) continue;
        for (let row = 0; row < 4; row++) {
          const pos = tile.getPowerHolePos(col, row);
          const dx = worldX - pos.x;
          const dy = worldY - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            best = {
              id: holeId(tile.tileX, tile.tileY, 'power', col, row),
              pos,
              tileX: tile.tileX,
              tileY: tile.tileY,
              type: 'power',
              col,
              row,
            };
          }
        }
      }
    }
    return best;
  }

  // Check if two holes are internally connected on the breadboard
  areConnected(idA, idB) {
    const a = parseHoleId(idA);
    const b = parseHoleId(idB);
    // Must be on the same tile
    if (a.tileX !== b.tileX || a.tileY !== b.tileY) return false;
    // Same type 
    if (a.type !== b.type) return false;

    if (a.type === 'main') {
      // Same column, same half (both 0-4 or both 5-9)
      if (a.col !== b.col) return false;
      const aHalf = a.row < 5 ? 0 : 1;
      const bHalf = b.row < 5 ? 0 : 1;
      return aHalf === bHalf;
    } else {
      // Power rail: same rail row, any column (full length)
      return a.row === b.row;
    }
  }

  // Get all holes connected to a given hole (by internal breadboard wiring)
  getConnectedHoles(id) {
    const h = parseHoleId(id);
    const results = [];
    if (h.type === 'main') {
      const halfStart = h.row < 5 ? 0 : 5;
      for (let r = halfStart; r < halfStart + 5; r++) {
        if (r !== h.row) {
          results.push(holeId(h.tileX, h.tileY, 'main', h.col, r));
        }
      }
    } else {
      // All holes in same power rail row
      for (let c = 0; c < GRID.COLS; c++) {
        if (c !== h.col) {
          results.push(holeId(h.tileX, h.tileY, 'power', c, h.row));
        }
      }
    }
    return results;
  }

  // Get total world dimensions
  getWorldSize() {
    return {
      width: this.tilesX * GRID.TILE_WIDTH,
      height: this.tilesY * GRID.TILE_HEIGHT,
    };
  }

  // Get display label for a row index (0-9 → A-J)
  static rowLabel(row) {
    return ROW_LABELS[row] || '?';
  }
}
