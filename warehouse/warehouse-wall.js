import * as THREE from "three";

// Matrix layout: 1 = wall, 0 = empty
export const wallMatrix = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

export function createWallTile(size = 10, height = 15) {
  const geometry = new THREE.BoxGeometry(size, height, size);
  const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const wall = new THREE.Mesh(geometry, material);
  wall.castShadow = true;
  return wall;
}
