// floor.js
import * as THREE from "three";
import { wallMatrix, createWallTile } from "./warehouse-wall";

const floorSize = 300;
const tileSize = 8;
const wallHeight = 15;

export function warehouse() {
  const warehouse = new THREE.Group();

  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  }); // other colors: 0x808080, 0x6e6e6e, 0xb3b3b3

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.1; // so it's above the ground

  warehouse.add(floor);

  for (let row = 0; row < wallMatrix.length; row++) {
    for (let col = 0; col < wallMatrix[row].length; col++) {
      if (wallMatrix[row][col] === 1) {
        const wall = createWallTile(tileSize, wallHeight);
        wall.position.set(
          col * tileSize - (wallMatrix[0].length * tileSize) / 2 + tileSize / 2,
          wallHeight / 2,
          row * tileSize - (wallMatrix.length * tileSize) / 2 + tileSize / 2
        );
        warehouse.add(wall);
      }
    }
  }

  return warehouse;
}
