import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  DEV_MODE,
  WAREHOUSE_SIZE,
  PLAYER_HEIGHT,
  weapAncPosX,
  weapAncPosY,
  weapAncPosZ,
  weapRotX,
  weapRotY,
  weapRotZ,
  weapScale,
} from "./src/core/constants.js";

import { createRenderer } from "./src/core/renderer.js";
import { createScene } from "./src/core/scene.js";
import { createControls } from "./src/core/controls.js";
import { createPlayerCollider } from "./src/player/player.js";
import { startGameLoop } from "./src/core/gameLoop.js";
import {
  playBackgroundMusic,
  loadWalkSound,
  loadSprintSound,
} from "./src/core/audio.js";

import { ZombieGroup } from "./src/zombie/zombieGroup";
import { wallMatrix, TILE_SIZE } from "./src/warehouse/warehouse.js";

import {
  initGun,
  updateRecoil,
  handlePointerDown,
  handleMouseDown,
} from "./src/gun/gun.js";

/* ── boot ──────────────────────────────────────────────────────────────────── */
const renderer = createRenderer();
const { scene, worldOctree } = createScene();

/* camera + controls */
const camera = new THREE.PerspectiveCamera(
  DEV_MODE ? 35 : 75,
  window.innerWidth / window.innerHeight,
  0.1,
  DEV_MODE ? 1000 : 500
);

const listener = new THREE.AudioListener();
camera.add(listener);

const walkSound = loadWalkSound(listener);
const sprintSound = loadSprintSound(listener);
playBackgroundMusic(listener);

const weaponAnchor = new THREE.Object3D();
camera.add(weaponAnchor);
weaponAnchor.position.set(weapAncPosX, weapAncPosY, weapAncPosZ);

const START_X = WAREHOUSE_SIZE / 2 - 1.5;
const START_Z = -5;
const spawn = new THREE.Vector3(START_X, PLAYER_HEIGHT, START_Z);
camera.position.copy(spawn);

const controls = createControls(camera, renderer.domElement);
initGun(weaponAnchor, controls);
if (!DEV_MODE) scene.add(controls.object);

/* player collider */
const playerCollider = createPlayerCollider(spawn);


// gun
const gltfLoader = new GLTFLoader();
let gun;
gltfLoader.load("./src/gun/result.gltf", (gltf) => {
  gun = gltf.scene;

  gun.rotation.set(weapRotX, weapRotY, weapRotZ); // e.g. Z-up → Y-up, flip to face forward
  gun.scale.setScalar(weapScale);
  weaponAnchor.add(gun);
  gun.renderOrder = 999;
  gun.material.depthTest = false;
});

// renderer.domElement.addEventListener('pointerdown', handlePointerDown);
document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // only left button
  handlePointerDown(e);
});

renderer.domElement.addEventListener("click", (e) => {
  if (!controls.isLocked) controls.lock(); // first click → lock cursor
});

function shoot(e) {
  if (e.button !== 0) return;
  gunRecoil();
}

function requestLock() {
  controls.lock();
}

// one click is enough to grab the pointer
renderer.domElement.addEventListener("click", requestLock);

// when the lock succeeds/fails, PointerLockControls dispatches these:
controls.addEventListener("lock", () => {
  document.addEventListener("mousedown", shoot);
});

controls.addEventListener("unlock", () => {
  document.removeEventListener("mousedown", shoot);
});
const zombieGroup = new ZombieGroup(30, wallMatrix, camera.position, scene);
console.log("peo");
/* start loop */
startGameLoop({
  camera,
  controls,
  renderer,
  scene,
  worldOctree,
  playerCollider,
  spawnPos: spawn,
  zombieGroup,
  updateRecoil,
  walkSound,
  sprintSound,
});

/* resize */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
