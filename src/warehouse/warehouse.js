// floor.js
import * as THREE from "three";
import { loadWallMatrix, createWallTile } from "./warehouse-wall";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const TILE_SIZE = 1;
const WALL_HEIGHT = 4;

async function getWallMatrix() {
  return await loadWallMatrix();
}

export const wallMatrix = await getWallMatrix();
console.log(wallMatrix);

export function warehouse(floorSize) {
  const warehouse = new THREE.Group();

  /* ─────────────────────────────────── FLOOR ──────────────────────────────────── */

  const loader = new GLTFLoader();
  loader.load(
    "textures/concrete/Untitled4.glb",
    (gltf) => {
      const floor = gltf.scene;
      floor.position.set(50, 0, 50);
      // floor.rotation.x = -Math.PI / 2;

      // const roof = gltf.scene.clone(true);
      // roof.position.set(50, WALL_HEIGHT, 50);

      warehouse.add(floor);
      // warehouse.add(roof);
    },
    undefined,
    (error) => {
      console.error("Error loading floor model:", error);
    }
  );

  // const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  // const floorMaterial = new THREE.MeshStandardMaterial({
  //   color: 0xffffff,
  //   side: THREE.DoubleSide,
  // }); // other colors: 0x808080, 0x6e6e6e, 0xb3b3b3

  // const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // floor.rotation.x = -Math.PI / 2;
  // floor.position.x = 50;
  // floor.position.z = 50;
  // floor.position.y = 0; // doesn't need to be above ground if there's the hole in the terrain

  // warehouse.add(floor);

  /* ─────────────────────────────────── WALLS ──────────────────────────────────── */

  for (let row = 0; row < wallMatrix.length; row++) {
    for (let col = 0; col < wallMatrix[row].length; col++) {
      if (wallMatrix[row][col] === 1) {
        const wall = createWallTile(TILE_SIZE, WALL_HEIGHT);
        wall.position.set(col * TILE_SIZE, WALL_HEIGHT / 2, row * TILE_SIZE);
        warehouse.add(wall);
      }
    }
  }

  /* ─────────────────────────────────── ROOF ──────────────────────────────────── */
  // const roofGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  // const roofMaterial = new THREE.MeshStandardMaterial({
  //   color: 0xaaaaaa,
  //   side: THREE.DoubleSide,
  // });

  // const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  // roof.rotation.x = -Math.PI / 2;
  // roof.position.x = 50;
  // roof.position.z = 50;
  // roof.position.y = WALL_HEIGHT;

  // warehouse.add(roof);

  const roofLoader = new GLTFLoader();
  roofLoader.load(
    "textures/concrete/Untitled4.glb",
    (gltf) => {
      const roof = gltf.scene;
      roof.position.set(50, WALL_HEIGHT, 50);
      // roof.rotation.x = -Math.PI / 2;

      // const roof = gltf.scene.clone(true);
      // roof.position.set(50, WALL_HEIGHT, 50);

      warehouse.add(roof);
      // warehouse.add(roof);
    },
    undefined,
    (error) => {
      console.error("Error loading roof model:", error);
    }
  );

  return warehouse;
}
