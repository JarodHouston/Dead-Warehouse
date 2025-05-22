import * as THREE from 'three';
import {
  DEV_MODE, WAREHOUSE_SIZE, PLAYER_HEIGHT
} from './src/core/constants.js';

import { createRenderer }            from './src/core/renderer.js';
import { createScene }               from './src/core/scene.js';
import { createControls }            from './src/core/controls.js';
import { createPlayerCollider }      from './src/player/player.js';
import { startGameLoop }             from './src/core/gameLoop.js';

import { computeZombieNextStep }     from './src/zombie/pathfinding.js';
import { createZombie }              from './src/zombie/model.js';
import { wallMatrix, TILE_SIZE }     from './src/warehouse/warehouse.js';

/* ── boot ──────────────────────────────────────────────────────────────────── */
const renderer               = createRenderer();
const { scene, worldOctree } = createScene();

/* camera + controls */
const camera = new THREE.PerspectiveCamera(
  DEV_MODE ? 35 : 75,
  window.innerWidth / window.innerHeight,
  0.1, DEV_MODE ? 1000 : 500
);
const START_X = WAREHOUSE_SIZE / 2 - 1.5;
const START_Z = -5;
const spawn   = new THREE.Vector3(START_X, PLAYER_HEIGHT, START_Z);
camera.position.copy(spawn);

const controls = createControls(camera, renderer.domElement);
if (!DEV_MODE) scene.add(controls.object);

/* player collider */
const playerCollider = createPlayerCollider(spawn);

/* zombie */
let zombieTile = { x:10, y:10 };
const zombie    = createZombie(0x00aa00);
scene.add(zombie);

/* AI step wrapper for gameLoop */
let lastUpdate = 0, interval = 0.2;
function updateZombie(time) {
  const playerTile = {
    x: Math.floor(camera.position.x / TILE_SIZE),
    y: Math.floor(camera.position.z / TILE_SIZE),
  };
  const next = computeZombieNextStep({ wallMatrix, from:zombieTile, to:playerTile });
  if (time - lastUpdate > interval && next) {
    lastUpdate = time;
    zombieTile = next;
    zombie.position.set(zombieTile.x, 0, zombieTile.y);
  }
}

/* start loop */
startGameLoop({
  camera, controls, renderer, scene,
  worldOctree, playerCollider, spawnPos:spawn,
  updateZombie
});

/* resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
