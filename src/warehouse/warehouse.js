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
  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load(
    "textures/concrete/concrete-image3.png"
  );
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(3, 3); // Adjust to repeat the texture

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
  });
  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(50, 0, 50);
  scene.add(floorMesh);

  /* ─────────────────────────────────── WALLS ──────────────────────────────────── */

  for (let row = 0; row < wallMatrix.length; row++) {
    for (let col = 0; col < wallMatrix[row].length; col++) {
      if (wallMatrix[row][col] === 1) {
        const wall = createWallTile(TILE_SIZE, WALL_HEIGHT);
        wall.position.set(col * TILE_SIZE, WALL_HEIGHT / 2, row * TILE_SIZE);
        warehouse.add(wall);
      } else if (wallMatrix[row][col] === 2) {
        // Create a hanging point light
        const light = new THREE.PointLight(0xffffff, 20, 40);
        const lightX = col * TILE_SIZE + TILE_SIZE / 2;
        const lightY = WALL_HEIGHT - 0.75; // slightly below ceiling
        const lightZ = row * TILE_SIZE + TILE_SIZE / 2;
        light.position.set(lightX, lightY, lightZ);

        // light.castShadow = true;
        // light.visible = false;
        scene.add(light);

        // const helper = new THREE.PointLightHelper(light, 0.5);
        // scene.add(helper);

        // Optional: Add visible bulb mesh
        const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(lightX, lightY, lightZ);

        pointLights.push({ light, bulb });
        warehouse.add(bulb);
      }
    }
  }

  /* ─────────────────────────────────── ROOF ──────────────────────────────────── */

  const roofGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const roofMesh = new THREE.Mesh(roofGeometry, floorMaterial);

  // Flip the plane to face down (so it’s visible from below)
  roofMesh.rotation.x = Math.PI / 2;

  // Set roof height (e.g., same as wall height)
  roofMesh.position.set(50, WALL_HEIGHT, 50); // Assuming wall height is 15

  scene.add(roofMesh);
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

  // const roofLoader = new GLTFLoader();
  // roofLoader.load(
  //   "textures/concrete/Untitled4.glb",
  //   (gltf) => {
  //     const roof = gltf.scene;
  //     roof.position.set(50, WALL_HEIGHT, 50);
  //     // roof.rotation.x = -Math.PI / 2;

  //     // const roof = gltf.scene.clone(true);
  //     // roof.position.set(50, WALL_HEIGHT, 50);

  //     warehouse.add(roof);
  //     // warehouse.add(roof);
  //   },
  //   undefined,
  //   (error) => {
  //     console.error("Error loading roof model:", error);
  //   }
  // );

  return warehouse;
}
