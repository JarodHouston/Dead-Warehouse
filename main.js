import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  DEV_MODE,
  WAREHOUSE_SIZE,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  weapAncPosX,
  weapAncPosY,
  weapAncPosZ,
  weapRotX,
  weapRotY,
  weapRotZ,
  weapScale,
  gunColor,
} from "./src/core/constants.js";

import { createRenderer } from "./src/core/renderer.js";
import { createScene } from "./src/core/scene.js";
import { createControls } from "./src/core/controls.js";
import { createPlayerCollider } from "./src/player/player.js";
import { createDeathSystem } from "./src/player/playerDeath.js";
import { startGameLoop } from "./src/core/gameLoop.js";
import {
  playBackgroundMusic,
  loadWalkSound,
  loadSprintSound,
  loadGunSound,
} from "./src/core/audio.js";
import { createZombieModel } from "./src/zombie/model.js";

import { ZombieGroup } from "./src/zombie/zombieGroup";
import { wallMatrix, TILE_SIZE } from "./src/warehouse/warehouse.js";

import {
  initGun,
  updateRecoil,
  handlePointerDown,
  handleMouseDown,
} from "./src/gun/gun.js";
import {
  initBulletSystem,
  spawnBullet,
  updateBullets,
  setTargets,
} from "./src/gun/bulletSystem.js";
import { handleShot } from "./src/gun/shoot.js";
import {
  addMuzzleFlash,
  triggerFlash,
  updateFlash,
} from "./src/gun/muzzleFlash.js";

/* ── boot ──────────────────────────────────────────────────────────────────── */
const renderer = createRenderer();
const { scene, worldOctree } = await createScene();

/* camera + controls */
const camera = new THREE.PerspectiveCamera(
  DEV_MODE ? 35 : 75,
  window.innerWidth / window.innerHeight,
  0.1,
  DEV_MODE ? 1000 : 500
);

initBulletSystem(camera, scene);

const listener = new THREE.AudioListener();
camera.add(listener);

const walkSound = loadWalkSound(listener);
const sprintSound = loadSprintSound(listener);
playBackgroundMusic(listener);

const weaponAnchor = new THREE.Object3D();
camera.add(weaponAnchor);
weaponAnchor.position.set(weapAncPosX, weapAncPosY, weapAncPosZ);

const START_X = WAREHOUSE_SIZE / 2 - 1.5;
const START_Z = 5;
const spawn = new THREE.Vector3(START_X, PLAYER_HEIGHT, START_Z);
camera.rotateY(Math.PI);
camera.position.copy(spawn);

const controls = createControls(camera, renderer.domElement);
initGun(weaponAnchor, controls);
if (!DEV_MODE) scene.add(controls.object);

/* player collider */
const playerCollider = createPlayerCollider(spawn);

// gun
const gltfLoader = new GLTFLoader();
let gun;
let muzzleFlash = null;
gltfLoader.load("./src/gun/result.gltf", (gltf) => {
  gun = gltf.scene;
  gun.rotation.set(weapRotX, weapRotY, weapRotZ);
  gun.scale.setScalar(weapScale);

  // gun color set
  gun.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      if ("color" in child.material) child.material.color.set(gunColor);
    }
  });

  weaponAnchor.add(gun);
  muzzleFlash = addMuzzleFlash(gun);
});

const raycaster = new THREE.Raycaster();
function shoot(e) {
  if (e.button !== 0) return;
  // shoot(raycaster);
  loadGunSound(listener);
  updateRecoil();
  handleShot(camera, raycaster, zombieGroup);
  spawnBullet(gun);
  if (muzzleFlash) triggerFlash(muzzleFlash);
}

const baseZombieModel = createZombieModel();
const zombieGroup = new ZombieGroup(
  2,
  wallMatrix,
  camera.position,
  scene,
  baseZombieModel
);

export const deathSystem = createDeathSystem({
  camera,
  spawn,
  playerCollider,
  PLAYER_RADIUS,
  PLAYER_HEIGHT,
  controls,
  walkSound,
  sprintSound,
  shoot,
  zombieGroup,
});

// renderer.domElement.addEventListener('pointerdown', handlePointerDown);
document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // only left button
  if (deathSystem.isDead()) {
    e.preventDefault();
    deathSystem.respawnPlayer();
    return;
  }
  if (!deathSystem.isDead()) handlePointerDown(e);
});

renderer.domElement.addEventListener("click", (e) => {
  if (!controls.isLocked) controls.lock(); // first click → lock cursor
});

function requestLock() {
  if (deathSystem.isDead()) return; // don’t re-lock while dead
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

function advanceSystems(delta) {
  if (deathSystem.isDead()) return;
  updateBullets(delta);
  if (muzzleFlash) updateFlash(muzzleFlash, delta);
}

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
  updateBullets,
  walkSound,
  sprintSound,
  onUpdate: advanceSystems,
});

/* resize */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
