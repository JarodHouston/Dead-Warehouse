import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { SUBSTEPS } from "./constants.js";
import { getKeys } from "./input.js";
import { handleInput, playerPhysics } from "./physics.js";
import { pointLights } from "../warehouse/warehouse.js";
import { updateRecoil as updateGunRecoil } from "../gun/gun.js";

let targetFOV = 75; // default FOV
const sprintFOV = 90; // FOV when sprinting
const normalFOV = 75; // FOV when walking

export let isSprinting = false;

let zombieSpawnTimer = 0;
let zombie_spawn_interval = 5;
let spawn_increase_rate = 0.05;

/**
 * Starts the main animation / simulation loop.
 *
 * @param {Object} cfg                       – configuration object
 * @param {THREE.PerspectiveCamera} camera   – player camera
 * @param {THREE.PointerLockControls} controls – movement controls
 * @param {THREE.WebGLRenderer} renderer     – renderer
 * @param {THREE.Scene} scene                – scene to render
 * @param {THREE.Octree} worldOctree         – collision world
 * @param {Capsule} playerCollider           – physics capsule
 * @param {THREE.Vector3} spawnPos           – fallback respawn position
 * @param {Function} updateZombie(time)      – AI update callback (secs)
 * @param {Function} updateRecoil()          – gun recoil update callback
 * @param {THREE.PositionalAudio} walkSound  – footstep audio
 * @param {THREE.PositionalAudio} sprintSound – sprint audio
 * @param {Function} [onUpdate]              – OPTIONAL per‑frame callback
 *                                            receives (deltaSeconds)
 */
export function startGameLoop({
  camera,
  controls,
  renderer,
  scene,
  worldOctree,
  playerCollider,
  spawnPos,
  zombieGroup,
  updateRecoil = () => {},
  updateBullets,
  walkSound,
  sprintSound,
  onUpdate = () => {}, // ← NEW: safely defaults to no‑op
}) {
  const clock = new THREE.Clock();
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  const velocity = new THREE.Vector3();
  let onFloor = false;

  function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    const step = Math.min(0.05, dt) / SUBSTEPS;
    const elapsed = clock.getElapsedTime();
    // ── Fixed‑timestep physics ------------------------------------------------
    for (let i = 0; i < SUBSTEPS; i++) {
      handleInput(
        step,
        getKeys(),
        velocity,
        camera,
        onFloor,
        walkSound,
        sprintSound
      );
      onFloor = playerPhysics(
        playerCollider,
        velocity,
        worldOctree,
        spawnPos,
        step
      );
    }
    controls.object.position.copy(playerCollider.end);

    // ── Variable‑rate updates -------------------------------------------------
    camera.fov += (targetFOV - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    updateRecoil();
    zombieGroup.animate(elapsed, dt);

    // Advance external systems (bullets, particles, etc.)
    onUpdate(dt);

    // ── Environment lights ---------------------------------------------------
    pointLights.forEach(({ light, bulb }) => {
      const distance = light.position.distanceTo(camera.position);
      const active = distance <= 20;
      light.visible = bulb.visible = active;

      // light.castShadow = true;
      // light.shadow.mapSize.set(512, 512);
      // light.shadow.bias = -0.005;

      if (active) {
        const baseIntensity = 15;
        if (Math.random() < 0.002) {
          light.intensity = baseIntensity * (0.5 + Math.random() * 0.5);
        } else if (Math.random() < 0.003) {
          light.intensity = baseIntensity * (Math.random() * 0.5);
        } else {
          light.intensity = baseIntensity + (Math.random() * 0.2 - 0.1);
        }
      }
    });

    // ── Zombie spawn ---------------------------------------------------------
    zombieSpawnTimer += dt;
    if (zombieSpawnTimer >= zombie_spawn_interval) {
      if (spawn_increase_rate > 1) {
        zombie_spawn_interval -= spawn_increase_rate;
      }
      zombieGroup.spawnZombie();
      zombieSpawnTimer = 0;
    }

    // ── Render ---------------------------------------------------------------
    renderer.render(scene, camera);
    stats.update();
  }

  animate();
}

// ── Sprint toggle (FOV & speed) ---------------------------------------------

document.addEventListener("keydown", (e) => {
  if (e.code === "ShiftLeft") {
    isSprinting = true;
    targetFOV = sprintFOV;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ShiftLeft") {
    isSprinting = false;
    targetFOV = normalFOV;
  }
});
