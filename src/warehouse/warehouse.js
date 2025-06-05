import * as THREE from "three";
import { loadWallMatrix, createWallTile } from "./warehouse-wall";
import {
  createShelfTile,
  createBoxTile,
  shelfMaterial,
} from "./warehouse-shelf";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const TILE_SIZE = 1;
const WALL_HEIGHT = 4;
const SHELF_HEIGHT = 2;
const BOX_HEIGHT = 0.5;

const invisibleGeometry = new THREE.BoxGeometry(
  TILE_SIZE,
  SHELF_HEIGHT,
  TILE_SIZE
);
const invisibleMaterial = new THREE.MeshBasicMaterial({ visible: true });

async function getWallMatrix() {
  return await loadWallMatrix();
}

export const wallMatrix = await getWallMatrix();
// console.log(wallMatrix);
export const meshMatrix = wallMatrix.map((row) => row.map(() => null));

export const pointLights = [];

const loader = new GLTFLoader();
let shelvesModel = null;
let shelvesModelTemplate = null;

export async function warehouse(scene, floorSize) {
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
  floorMesh.receiveShadow = true;

  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(50, 0, 50);
  scene.add(floorMesh);

  /* ─────────────────────────────────── WALLS ──────────────────────────────────── */

  if (!shelvesModelTemplate) {
    shelvesModelTemplate = await new Promise((resolve, reject) => {
      loader.load(
        "assets/models/psx_storage_shelves__cardboard_boxs.glb",
        (gltf) => resolve(gltf.scene),
        undefined,
        reject
      );
    });
  }

  for (let row = 0; row < wallMatrix.length; row++) {
    for (let col = 0; col < wallMatrix[row].length; col++) {
      if (wallMatrix[row][col] === 1) {
        const wall = createWallTile(TILE_SIZE, WALL_HEIGHT);
        wall.position.set(col * TILE_SIZE, WALL_HEIGHT / 2, row * TILE_SIZE);
        warehouse.add(wall);
        meshMatrix[row][col] = wall;
      } else if (wallMatrix[row][col] === 2) {
        // Create a hanging point light
        const light = new THREE.PointLight(0xffffff, 12, 40);
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
      } else if (wallMatrix[row][col] === -1) {
        const wall = new THREE.Mesh(invisibleGeometry, shelfMaterial);
        wall.visible = false; // Important: mesh must be hidden, not material
        wall.position.set(col * TILE_SIZE, SHELF_HEIGHT / 4, row * TILE_SIZE);
        meshMatrix[row][col] = wall;
        scene.add(wall);
      } else if (wallMatrix[row][col] === 3) {
        let shelfWall = null;
        let boxWall = null;
        const placeShelf = (modelInstance) => {
          modelInstance.scale.set(1, 1, 1); // Adjust scale if needed
          modelInstance.rotation.y = 0; // Default rotation
          shelfWall = createShelfTile(TILE_SIZE, SHELF_HEIGHT, "horizontal");
          boxWall = createBoxTile(TILE_SIZE, BOX_HEIGHT, "horizontal");
          // add to mesh matrix, but not here
          boxWall.position.set(
            col * TILE_SIZE,
            SHELF_HEIGHT / 4,
            (row + 1) * TILE_SIZE
          );
          // Boundary-safe rotation logic (as described above)
          if (
            col > 0 &&
            wallMatrix[row][col - 1] !== undefined &&
            wallMatrix[row][col - 1] !== -1
          ) {
            modelInstance.rotation.y = Math.PI / 2;
            shelfWall = createShelfTile(TILE_SIZE, SHELF_HEIGHT, "vertical");
            boxWall = createBoxTile(TILE_SIZE, BOX_HEIGHT, "vertical");
            boxWall.position.set(
              (col + 1) * TILE_SIZE,
              SHELF_HEIGHT / 4,
              row * TILE_SIZE
            );
          } else if (
            row + 1 < wallMatrix.length &&
            wallMatrix[row + 1] !== undefined &&
            wallMatrix[row + 1][col] !== undefined &&
            wallMatrix[row + 1][col] !== -1
          ) {
            modelInstance.rotation.y = Math.PI;
            shelfWall = createShelfTile(TILE_SIZE, SHELF_HEIGHT, "horizontal");
            boxWall = createBoxTile(TILE_SIZE, BOX_HEIGHT, "horizontal");
            boxWall.position.set(
              col * TILE_SIZE,
              SHELF_HEIGHT / 4,
              (row - 1) * TILE_SIZE
            );
          } else if (
            col + 1 < wallMatrix[row].length &&
            wallMatrix[row][col + 1] !== undefined &&
            wallMatrix[row][col + 1] !== -1
          ) {
            modelInstance.rotation.y = -Math.PI / 2;
            shelfWall = createShelfTile(TILE_SIZE, SHELF_HEIGHT, "vertical");
            boxWall = createBoxTile(TILE_SIZE, BOX_HEIGHT, "vertical");
            boxWall.position.set(
              (col - 1) * TILE_SIZE,
              SHELF_HEIGHT / 4,
              row * TILE_SIZE
            );
          }
          modelInstance.position.set(col * TILE_SIZE, 0, row * TILE_SIZE);
          scene.add(modelInstance);
        };
        if (!shelvesModelTemplate) {
          console.log("Error loading shelf");
        } else {
          // If template is already loaded, just clone it
          const newShelves = shelvesModelTemplate.clone();
          placeShelf(newShelves);
        }
        if (shelfWall) {
          shelfWall.position.set(
            col * TILE_SIZE,
            SHELF_HEIGHT / 4,
            row * TILE_SIZE
          );
          warehouse.add(shelfWall);
        }
        warehouse.add(boxWall);
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
