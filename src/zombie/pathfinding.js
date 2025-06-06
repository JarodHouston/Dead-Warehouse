import { wallMatrix } from "../warehouse/warehouse";
import { meshMatrix } from "../warehouse/warehouse";
import * as THREE from "three";

// 1. Precompute the = neighborhood (radius = 3) â†’ 48 offsets
const NEIGHBORS_RADIUS_3_SQUARE = [];
const rad = 3;
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

// 4. Checks collisionâ€free â€œsweepâ€ of a circle from `fromPos` â†’ `toPos`
function isPathClear(fP, tP, r) {
  const fromPos = new THREE.Vector3(fP.x, 0.5, fP.y);
  const toPos = new THREE.Vector3(tP.x, 0.5, tP.y);

  // build direction & perpendicular
  const dir = new THREE.Vector3().subVectors(toPos, fromPos);
  const dist = dir.length();
  dir.normalize();
  const perp = new THREE.Vector3(-dir.z, 0, dir.x);

  // three ray origins
  const origins = [
    fromPos.clone(),
    fromPos.clone().addScaledVector(perp, r),
    fromPos.clone().addScaledVector(perp, -r),
  ];

  // find all wall meshes in a 3Ã—3â€tile square around the *from* tile
  const cx = Math.floor(fP.x);
  const cy = Math.floor(fP.y);
  const localMeshes = [];
  // include the center tile
  const center = meshMatrix[cy]?.[cx];
  if (center) localMeshes.push(center);
  // include all 48 neighbors
  for (const { dx, dy } of NEIGHBORS_RADIUS_3_SQUARE) {
    const m = meshMatrix[cy + dy]?.[cx + dx];
    if (m) localMeshes.push(m);
  }
  if (localMeshes.length === 0) return true;

  // 3) raycast against that tiny subset
  const rc = new THREE.Raycaster();
  rc.near = 0;
  rc.far = dist;

  for (let origin of origins) {
    rc.set(origin, dir);
    if (rc.intersectObjects(localMeshes, false).length) {
      return false;
    }
  }
  return true;
}

// 5. Main A* + return FIRST step only
//    position: {x: float, y: float}
//    targetTile: {x: int, y: int}
//    wallMatrix: 2D array of 0/1
export function getNextStep(position, targetTile, radius = 0.5) {
  const startTile = {
    x: Math.floor(position.x),
    y: Math.floor(position.y),
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
        { x: startTile.x + 0.5, y: startTile.y + 0.5 },
        { x: goalTile.x + 0.5, y: goalTile.y + 0.5 }
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

    // 5.b. If reached goal, reconstruct full tile path â†’ return just the first step
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
      if (wallMatrix[neighborTile.y]?.[neighborTile.x] === undefined) continue;

      // Compute world-space positions for collision check
      const fromPos =
        currKey === startKey
          ? position
          : { x: current.x + 0.5, y: current.y + 0.5 };
      const toPos = { x: neighborTile.x + 0.5, y: neighborTile.y + 0.5 };

      // Collisionâ€sweep test
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
          tentativeG + dist(toPos, { x: goalTile.x + 0.5, y: goalTile.y + 0.5 })
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
