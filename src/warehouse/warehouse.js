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
// console.log(wallMatrix);

export const pointLights = [];

export function warehouse(scene, floorSize) {
  const warehouse = new THREE.Group();

  /* ─────────────────────────────────── FLOOR ──────────────────────────────────── */

  const loader = new GLTFLoader();
  loader.load(
    "textures/concrete/Untitled4.glb",
    (gltf) => {
      const floor = gltf.scene;
      //floor.scale.set(0.1, 0.1, 0.1);
      floor.position.set(50, 0, 50);

      // floor.traverse((child) => {
      //   if (child.isMesh) {
      //     // Convert to light-reactive material if needed
      //     if (!(child.material instanceof THREE.MeshStandardMaterial)) {
      //       const oldMat = child.material;
      //       child.material = new THREE.MeshStandardMaterial({
      //         map: oldMat.map || null,
      //         color: oldMat.color || new THREE.Color(0xffffff),
      //         side: THREE.DoubleSide,
      //       });
      //     }
      //     child.receiveShadow = true;
      //     child.castShadow = false; // usually floor doesn't cast shadow
      //   }
      // });

      warehouse.add(floor);
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
      } else if (wallMatrix[row][col] === 2) {
        // Create a hanging point light
        const light = new THREE.PointLight(0xffffff, 2, 30);
        const lightX = col * TILE_SIZE + TILE_SIZE / 2;
        const lightY = WALL_HEIGHT - 0.5; // slightly below ceiling
        const lightZ = row * TILE_SIZE + TILE_SIZE / 2;
        light.position.set(lightX, lightY, lightZ);
        // light.castShadow = true;
        // light.visible = false;
        scene.add(light);

        pointLights.push(light);

        const helper = new THREE.PointLightHelper(light, 0.5);
        scene.add(helper);

        // Optional: Add visible bulb mesh
        const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(lightX, lightY, lightZ);
        warehouse.add(bulb);
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
