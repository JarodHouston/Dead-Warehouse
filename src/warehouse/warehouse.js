// floor.js
import * as THREE from "three";
import { loadWallMatrix, createWallTile } from "./warehouse-wall";

export const tileSize = 1;
const wallHeight = 3;

async function getWallMatrix() {
  return await loadWallMatrix();
}

export const wallMatrix = await getWallMatrix();
console.log(wallMatrix);

export function warehouse(floorSize) {
  const warehouse = new THREE.Group();

  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  }); // other colors: 0x808080, 0x6e6e6e, 0xb3b3b3

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0; // doesn't need to be above ground if there's the hole in the terrain

  warehouse.add(floor);

  for (let row = 0; row < wallMatrix.length; row++) {
    for (let col = 0; col < wallMatrix[row].length; col++) {
      if (wallMatrix[row][col] === 1) {
        const wall = createWallTile(tileSize, wallHeight);
        wall.position.set(
          col * tileSize,
          wallHeight / 2,
          row * tileSize
        );
        warehouse.add(wall);
      }
    }
  }

  return warehouse;
}
