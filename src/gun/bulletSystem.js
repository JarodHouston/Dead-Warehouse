import * as THREE from "three";

// --------------------------------- Config ----------------------------------
const BULLET_SPEED = 75;          // units / second
const MAX_BULLET_LIFETIME = 3;    // seconds
const BULLET_SIZE = 0.05;         // visual radius

// --------------------------------- State -----------------------------------
const raycaster = new THREE.Raycaster();
const bullets = [];                   // active bullets [{ mesh, spawnTime }]
let availableTargets = [];            // objects we can hit (Groups or Meshes)
let mainCamera;                       // set by initBulletSystem()
let gameScene;

// --------------------------------- API -------------------------------------
export function initBulletSystem(camera, scene) {
  mainCamera = camera;
  gameScene = scene;
  clearBullets();
}

export function setTargets(targets) {
  availableTargets = targets;
}

export function spawnBullet(originObject = mainCamera) {
  if (!originObject || !gameScene) {
    console.error("[BulletSystem] initBulletSystem() not called yet.");
    return;
  }

  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(BULLET_SIZE, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );

  originObject.getWorldPosition(bullet.position);
  originObject.getWorldQuaternion(bullet.quaternion);

  gameScene.add(bullet);
  bullets.push({ mesh: bullet, spawnTime: performance.now() * 0.001 });
}

export function updateBullets(delta) {
  if (!mainCamera) return;

  // Ensure every object's worldMatrix is current before we ray‑cast.
  gameScene?.updateMatrixWorld(true);

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bulletData = bullets[i];
    const { mesh } = bulletData;

    // Lifetime -------------------------------------------------------------
    if (performance.now() * 0.001 - bulletData.spawnTime > MAX_BULLET_LIFETIME) {
      despawnBullet(i);
      continue;
    }

    // Travel direction (world space)
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(mesh.quaternion).normalize();
    const dist = BULLET_SPEED * delta;

    // Raycast along this frame's path
    raycaster.set(mesh.position, dir);
    raycaster.far = dist;

    const hits = raycaster.intersectObjects(availableTargets, true);
    if (hits.length) {
      const hit = hits[0];
      const root = findRootTarget(hit.object);

      if (root?.onHit) root.onHit(hit);
      else root?.parent?.remove(root);

      despawnBullet(i);
      continue;
    }

    // Move forward
    mesh.position.addScaledVector(dir, dist);
  }
}

// -------------------------------- Helpers ---------------------------------- ----------------------------------
function despawnBullet(index) {
  const bullet = bullets[index].mesh;
  bullet.parent?.remove(bullet);
  bullets.splice(index, 1);
}

function clearBullets() {
  for (const b of bullets) b.mesh.parent?.remove(b.mesh);
  bullets.length = 0;
}

// Climb up hierarchy until we reach an object present in availableTargets or
// the scene root.
function findRootTarget(obj) {
  let current = obj;
  while (current && !availableTargets.includes(current) && current.parent) {
    current = current.parent;
  }
  return current;
}
