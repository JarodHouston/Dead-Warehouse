import { wallMatrix } from "../warehouse/warehouse";
import { meshMatrix } from "../warehouse/warehouse";
import * as THREE from "three";

// 1. Precompute the neighborhood
const NEIGHBORS_RADIUS_3_SQUARE = [];
const rad = 2;
for (let dx = -rad; dx <= rad; dx++) {
  for (let dy = -rad; dy <= rad; dy++) {
    if (dx === 0 && dy === 0) continue;
    NEIGHBORS_RADIUS_3_SQUARE.push({ dx, dy });
  }
}

// 2. Euclidean distance helper
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 4. Checks collisionsfree of a circle from `fromPos` to `toPos`
function isPathClear(fP, tP, r) {
  // Extract start/end in 2D
  const x0 = fP.x, y0 = fP.y;
  const x1 = tP.x, y1 = tP.y;

  // Compute direction vector (dx, dy) and its length
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  // If length is zero, trivially clear (no movement)
  if (L === 0) {
    // You could still check the single cell, but typically we let it be clear.
    return true;
  }

  // Unit‐direction
  const invL = 1 / L;
  const dirX = dx * invL;
  const dirY = dy * invL;

  // Perpendicular to (dirX, dirY) in 2D is (-dirY, dirX)
  const perpX = -dirY;
  const perpY = dirX;

  // Build the three offset vectors:
  //  (0,0),  (+perp * r),  (−perp * r)
  const offsets = [
    { ox: 0,       oy: 0 },
    { ox: perpX * r,  oy: perpY * r },
    { ox: -perpX * r, oy: -perpY * r }
  ];

  // For each offset line, check if the grid‐walk is clear.
  for (const { ox, oy } of offsets) {
    const sx = x0 + ox;
    const sy = y0 + oy;
    const ex = x1 + ox;
    const ey = y1 + oy;

    if (! _lineSegmentIsClear(sx, sy, ex, ey, wallMatrix)) {
      return false;
    }
  }

  // All three “lines” were clear.
  return true;
}

/**
 * Walk a 2D line segment from (x0,y0) → (x1,y1) through the integer grid.
 * Return false as soon as we hit a cell (ix,iy) where wallMatrix[iy][ix] is
 * not 0 or 2.  Otherwise return true.
 *
 * Implementation: Amanatides–Woo 2D DDA/voxel‐traversal algorithm.
 */
function _lineSegmentIsClear(x0, y0, x1, y1, wallMatrix) {
  // Starting grid cell
  let ix = Math.floor(x0);
  let iy = Math.floor(y0);

  // Ending grid cell
  const endIx = Math.floor(x1);
  const endIy = Math.floor(y1);

  // Delta along each axis
  const dx = x1 - x0;
  const dy = y1 - y0;

  // Compute stepX, stepY ∈ {−1, 0, +1}
  const stepX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
  const stepY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);

  // tDeltaX = how far t must advance to cross one cell‐boundary in X
  const tDeltaX = (stepX !== 0) ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = (stepY !== 0) ? Math.abs(1 / dy) : Infinity;

  // tMaxX = distance in “t” until the first vertical grid boundary is crossed
  let tMaxX;
  if (stepX > 0) {
    // Next vertical boundary is at floor(x0) + 1
    tMaxX = tDeltaX * ((Math.floor(x0) + 1) - x0);
  } else if (stepX < 0) {
    // Next vertical boundary is at floor(x0) (because we are moving negative)
    tMaxX = tDeltaX * (x0 - Math.floor(x0));
  } else {
    tMaxX = Infinity;
  }

  // tMaxY = distance in “t” until the first horizontal grid boundary is crossed
  let tMaxY;
  if (stepY > 0) {
    // Next horizontal boundary is at floor(y0) + 1
    tMaxY = tDeltaY * ((Math.floor(y0) + 1) - y0);
  } else if (stepY < 0) {
    // Next horizontal boundary is at floor(y0)
    tMaxY = tDeltaY * (y0 - Math.floor(y0));
  } else {
    tMaxY = Infinity;
  }

  // Helper to test if a given (ix, iy) is blocked.
  function _isBlocked(cx, cy) {
    // If out‐of‐bounds, treat as blocked
    if (cy < 0 || cy >= wallMatrix.length) return true;
    if (cx < 0 || cx >= wallMatrix[0].length) return true;

    const cell = wallMatrix[cy][cx];
    // Passable if 0 or 2; otherwise blocked
    return (cell !== 0 && cell !== 2);
  }

  // First, check the starting cell (maybe the agent is already “inside” a wall)
  if (_isBlocked(ix, iy)) {
    return false;
  }

  // Walk until we reach the end cell
  while (ix !== endIx || iy !== endIy) {
    // Decide whether to step in X or in Y next
    if (tMaxX < tMaxY) {
      // Next crossing is a vertical boundary
      ix += stepX;
      tMaxX += tDeltaX;
    } else {
      // Next crossing is a horizontal boundary
      iy += stepY;
      tMaxY += tDeltaY;
    }

    // After stepping, check the new cell
    if (_isBlocked(ix, iy)) {
      return false;
    }
  }

  // We also mark the endpoint cell as checked (though the loop already does
  // it, so this is optional redundancy). That ensures we never miss the last cell.
  // (The while‐loop “landed” in (endIx,endIy), so we’ve already checked it.)

  return true; // never hit a blocked tile
}

// 5. Main A* + return FIRST step only
//    position: {x: float, y: float}
//    targetTile: {x: int, y: int}
//    wallMatrix: 2D array of 0/1
export function getNextStep(position, targetTile, radius = 2) {
  const startTile = {
    x: Math.floor(position.x + 0.5),
    y: Math.floor(position.y + 0.5),
  };
  const goalTile = { x: targetTile.x, y: targetTile.y };
  if (startTile == goalTile) return null;
  const startKey = `${startTile.x},${startTile.y}`;
  const goalKey = `${goalTile.x},${goalTile.y}`;

  const openSet = [startTile];
  const cameFrom = new Map();
  const gScore = new Map([[startKey, 0]]);
  const fScore = new Map([
    [
      startKey,
      dist(
        { x: startTile.x , y: startTile.y  },
        { x: goalTile.x , y: goalTile.y}
      ),
    ],
  ]);

  const rows = wallMatrix.length;
  const cols = wallMatrix[0].length;
  const outOfBounds = (t) => t.x < 0 || t.y < 0 || t.y >= rows || t.x >= cols;
  if (outOfBounds(goalTile)) {
    return null;
  }
  while (openSet.length > 0) {
    // 5.a. Pick node in openSet with lowest fScore
    let current = openSet.reduce((a, b) => {
      const fa = fScore.get(`${a.x},${a.y}`) ?? Infinity;
      const fb = fScore.get(`${b.x},${b.y}`) ?? Infinity;
      return fa < fb ? a : b;
    });

    const currKey = `${current.x},${current.y}`;

    // 5.b. If reached goal, reconstruct full tile path, return just the first step
    if (currKey === goalKey) {
      const pathTiles = [];
      let key = goalKey;
      while (key !== startKey) {
        const [kx, ky] = key.split(",").map(Number);
        pathTiles.unshift({ x: kx, y: ky });
        key = cameFrom.get(key);
      }
      if (pathTiles.length === 0) {
        // Already at goal
        return null;
      }
      //const nextTile = pathTiles[0];
      return pathTiles;
    }

    // 5.c. Remove current from openSet
    openSet.splice(
      openSet.findIndex((n) => `${n.x},${n.y}` === currKey),
      1
    );

    // 5.d. Explore all 48 neighbors
    for (const { dx, dy } of NEIGHBORS_RADIUS_3_SQUARE) {
      const neighborTile = { x: current.x + dx, y: current.y + dy };
      const neighKey = `${neighborTile.x},${neighborTile.y}`;

      // Skip out-of-bounds
      if (wallMatrix[neighborTile.y]?.[neighborTile.x] === undefined || (wallMatrix[neighborTile.y][neighborTile.x] != 0 && wallMatrix[neighborTile.y][neighborTile.x] != 2)) continue;

      // Compute world-space positions for collision check
      const fromPos =
        currKey === startKey
          ? position
          : { x: current.x, y: current.y};
      const toPos = { x: neighborTile.x, y: neighborTile.y};

      // Collisionsweep test
      if (!isPathClear(fromPos, toPos, radius)) {
        continue;
      }

      // A* tentative gScore
      const tentativeG =
        (gScore.get(currKey) ?? Infinity) + dist(fromPos, toPos);

      if (tentativeG < (gScore.get(neighKey) ?? Infinity)) {
        cameFrom.set(neighKey, currKey);
        gScore.set(neighKey, tentativeG);
        fScore.set(
          neighKey,
          tentativeG + dist(toPos, { x: goalTile.x, y: goalTile.y})
        );

        // Add to openSet if not already there
        if (!openSet.some((n) => `${n.x},${n.y}` === neighKey)) {
          openSet.push(neighborTile);
        }
      }
    }
  }

  // No path found
  return null;
}
