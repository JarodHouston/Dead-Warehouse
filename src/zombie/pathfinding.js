// Compute the shortest path using Dijkstra and return the next tile
export function computeZombieNextStep({ wallMatrix, from, to }) {
  const rows = wallMatrix.length;
  const cols = wallMatrix[0].length;

  // Helper: check if a tile is walkable and in bounds
  function isValid(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < cols &&
      y < rows &&
      wallMatrix[y][x] === 0
    );
  }

  const queue = [];
  const visited = new Set();
  const parent = new Map();

  const fromKey = `${from.x},${from.y}`;
  const toKey = `${to.x},${to.y}`;

  queue.push(fromKey);
  visited.add(fromKey);

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0] // 4-way (up, right, down, left)
  ];

  while (queue.length > 0) {
    const currentKey = queue.shift();
    const [cx, cy] = currentKey.split(",").map(Number);

    if (currentKey === toKey) break;

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      const neighborKey = `${nx},${ny}`;

      if (isValid(nx, ny) && !visited.has(neighborKey)) {
        queue.push(neighborKey);
        visited.add(neighborKey);
        parent.set(neighborKey, currentKey);
      }
    }
  }

  // Reconstruct path
  if (!parent.has(toKey)) {
    return null; // No path
  }

  let path = [];
  let current = toKey;
  while (current !== fromKey) {
    path.unshift(current);
    current = parent.get(current);
  }

  const [nextX, nextY] = path[0].split(",").map(Number);
  return { x: nextX, y: nextY };
}