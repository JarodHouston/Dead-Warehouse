import * as THREE from "three";

// Matrix layout: 1 = wall, 0 = empty
// export const wallMatrix = [
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 1, 1, 1, 1, 0, 1],
//   [1, 0, 1, 0, 0, 1, 0, 1],
//   [1, 0, 1, 0, 0, 1, 0, 1],
//   [1, 0, 1, 1, 1, 1, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 1, 1, 1, 1, 1, 1, 1],
// ];

export async function loadWallMatrix() {
  try {
    const response = await fetch("/wallMatrix.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const matrix = await response.json();
    return matrix;
  } catch (err) {
    console.error("Error fetching wall matrix:", err);
    return [];
  }
}

export function createWallTile(size = 2, height = 5) {
  const geometry = new THREE.BoxGeometry(size, height, size);
  const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const wall = new THREE.Mesh(geometry, material);
  wall.castShadow = true;
  return wall;
}
