import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js"; // FPS overlay (optional)
import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { warehouse } from "./src/warehouse/warehouse.js";
import { computeZombieNextStep } from "./src/zombie/pathfinding.js";
import { tileSize } from "./src/warehouse/warehouse.js";
import { wallMatrix } from "./src/warehouse/warehouse.js";
import { createZombie } from "./src/zombie/model.js";

/* ─────────────────────────────── GLOBAL CONSTANTS ────────────────────────────── */
const DEV_MODE = false; // true = free‑fly Orbit camera
const TERRAIN_SIZE = 500;
const WAREHOUSE_SIZE = 100;

// Player
const PLAYER_HEIGHT = 1.6; // metres (eye position)
const PLAYER_RADIUS = 0.1; // capsule radius
const WALK_SPEED = 5; // m·s‑1
const JUMP_SPEED = 10; // m·s‑1 impulse
const GRAVITY = 30; // m·s‑2
const SUBSTEPS = 5; // physics micro‑steps per frame

/* ─────────────────────────────── SCENE & RENDERER ────────────────────────────── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x110124); // sky‑blue

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* ─────────────────────────────── CAMERA & CONTROLS ───────────────────────────── */
let camera, controls;

// Spawn **outside** the warehouse hole so we stand on solid ground
const START_X = 100;
const START_Z = WAREHOUSE_SIZE / 2 + 5;
const SPAWN_POS = new THREE.Vector3(START_X, PLAYER_HEIGHT, START_Z);

if (DEV_MODE) {
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 300, 0);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.05;
} else {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.copy(SPAWN_POS);

  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  window.addEventListener("click", () => controls.lock());

  // Graceful exit with Esc key
  document.addEventListener("pointerlockchange", () => {
    if (!document.pointerLockElement) {
      controls.unlock();
    }
  });
}

/* ─────────────────────────────────── LIGHTS ──────────────────────────────────── */
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(100, 200, 100);
sun.castShadow = true;
scene.add(sun);

/* ─────────────────────────────── TERRAIN PLANE ──────────────────────────────── */
// Simple solid ground so you never fall through a hole
const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE),
  new THREE.MeshStandardMaterial({ color: 0x228b22, flatShading: true })
);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
terrain.position.y = -PLAYER_RADIUS; // perfectly grounded spawn
scene.add(terrain);

/* ─────────────────────────────── WAREHOUSE PROP ─────────────────────────────── */
let warehouseObject;
try {
  warehouseObject = warehouse(WAREHOUSE_SIZE);
  scene.add(warehouseObject);
} catch (e) {
  console.warn("warehouse() prefab missing – using placeholder cube", e);
  warehouseObject = new THREE.Mesh(
    new THREE.BoxGeometry(WAREHOUSE_SIZE, 20, WAREHOUSE_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x999999 })
  );
  warehouseObject.position.y = 10;
  scene.add(warehouseObject);
}

/* ───────────────────────────────── OCTREE SETUP ─────────────────────────────── */
const worldOctree = new Octree();
worldOctree.fromGraphNode(terrain);
worldOctree.fromGraphNode(warehouseObject);

// if (DEV_MODE) {
//   const octreeHelper = new OctreeHelper(worldOctree);
//   scene.add(octreeHelper);
// }

/* ─────────────────────────────── PLAYER COLLIDER ────────────────────────────── */
const playerCollider = new Capsule(
  new THREE.Vector3(SPAWN_POS.x, PLAYER_RADIUS, SPAWN_POS.z),
  new THREE.Vector3(SPAWN_POS.x, PLAYER_HEIGHT, SPAWN_POS.z),
  PLAYER_RADIUS
);

/* ───────────────────────────────── INPUT ────────────────────────────────────── */
const keys = { w: false, a: false, s: false, d: false, " ": false };
if (!DEV_MODE) {
  window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase()))
      keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase()))
      keys[e.key.toLowerCase()] = false;
  });
}

/* ─────────────────────────────── PHYSICS HELPERS ───────────────────────────── */
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const tmpVec = new THREE.Vector3();
const horiz = new THREE.Vector3();
const side = new THREE.Vector3();
let onFloor = false;

function handleInput(dt) {
  // 1.  Build horizontal input vector from WASD
  horiz.set(
    Number(keys.d) - Number(keys.a), // +1 = right, –1 = left
    0,
    Number(keys.s) - Number(keys.w) // +1 = back,  –1 = forward
  );

  if (horiz.lengthSq() > 0) {
    // 2.  Camera-forward on the ground plane
    controls.getDirection(tmpVec); // world forward
    tmpVec.y = 0;
    tmpVec.normalize();

    // 3.  Camera-right (correct cross-product order!)
    side.crossVectors(tmpVec, camera.up).normalize();

    // 4.  Combine: forward/back + left/right
    //     w / s  → horiz.z   (-1 / +1)
    //     a / d  → horiz.x   (-1 / +1)
    const moveDir = tmpVec
      .clone()
      .multiplyScalar(-horiz.z)
      .add(side.clone().multiplyScalar(horiz.x));

    velocity.x = moveDir.x * WALK_SPEED; // keep vertical velocity.y untouched
    velocity.z = moveDir.z * WALK_SPEED;
  } else {
    velocity.x = velocity.z = 0; // stop horizontal motion only
  }

  // 5.  Jump
  if (onFloor && keys[" "]) velocity.y = JUMP_SPEED;
}

function playerPhysics(dt) {
  // Apply gravity
  if (!onFloor) velocity.y -= GRAVITY * dt;

  // Move the capsule
  playerCollider.translate(velocity.clone().multiplyScalar(dt));

  // Resolve collisions
  const result = worldOctree.capsuleIntersect(playerCollider);
  onFloor = false;
  if (result) {
    onFloor = result.normal.y > 0.5;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
    velocity.addScaledVector(result.normal, -result.normal.dot(velocity));
  }

  // Respawn if fallen out of the world
  if (playerCollider.end.y < -10) {
    playerCollider.start.set(SPAWN_POS.x, PLAYER_RADIUS, SPAWN_POS.z);
    playerCollider.end.set(SPAWN_POS.x, PLAYER_HEIGHT, SPAWN_POS.z);
    controls.getObject().position.copy(SPAWN_POS);
    velocity.set(0, 0, 0);
  }
}

function syncCamera() {
  controls.getObject().position.copy(playerCollider.end);
}

/* ─────────────────────────── RESIZE HANDLING ──────────────────────────────── */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ─────────────────────────── MAIN ANIMATION LOOP ──────────────────────────── */
const clock = new THREE.Clock();

let zombie = createZombie(0x00aa00);
scene.add(zombie);
let zombieTile = { x: 10, y: 10 };
//zombie.position.set(10, 0, 10)
console.log(camera.position / tileSize);
let interval = 0.2;
let lastUpdate = 0;

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (DEV_MODE) {
    controls.update();
  } else {
    const step = Math.min(0.05, dt) / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
      handleInput(step);
      playerPhysics(step);
    }
    syncCamera();

    // Nemo's stuff
    const time = clock.getElapsedTime();
    const playerTile = {
      x: Math.floor(camera.position.x / tileSize),
      y: Math.floor(camera.position.z / tileSize),
    };
    const next = computeZombieNextStep({
      wallMatrix,
      from: zombieTile,
      to: playerTile,
    });
    if (time - lastUpdate > interval && next) {
      lastUpdate = time;

      zombieTile = next;
      console.log(zombie);
      //console.log(zombieTile);
      zombie.position.set(zombieTile.x, 0, zombieTile.y);
    }
  }

  renderer.render(scene, camera);
  stats.update();
}

animate();
