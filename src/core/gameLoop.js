import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { SUBSTEPS } from "./constants.js";
import { getKeys } from "./input.js";
import { handleInput, playerPhysics } from "./physics.js";
import { pointLights } from "../warehouse/warehouse.js";
import { updateRecoil } from "../gun/gun.js";

let targetFOV = 75; // default FOV
const sprintFOV = 90; // FOV when sprinting
const normalFOV = 75; // FOV when walking

export let isSprinting = false;

export function startGameLoop({
  camera,
  controls,
  renderer,
  scene,
  worldOctree,
  playerCollider,
  spawnPos,
  updateZombie,
  updateRecoil,
  walkSound,
  sprintSound,
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
    controls.getObject().position.copy(playerCollider.end);

    // Change perspective for sprint
    camera.fov += (targetFOV - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    updateRecoil();
    updateZombie(clock.getElapsedTime()); // your AI tick

    // Show point lights that are close to player
    pointLights.forEach(({ light, bulb }) => {
      const distance = light.position.distanceTo(camera.position);
      const active = distance <= 25;

      light.visible = active;
      bulb.visible = active;

      if (active) {
        const baseIntensity = 20;

        // Random burst chance
        if (Math.random() < 0.002) {
          light.intensity = baseIntensity * (0.5 + Math.random() * 0.5); // burst flicker
        } else if (Math.random() < 0.003) {
          light.intensity = baseIntensity * (Math.random() * 0.5);
        } else {
          const flicker = Math.random() * 0.2 - 0.1;
          light.intensity = baseIntensity + flicker;
        }
      }

      // bulb.material.emissiveIntensity = active ? 1 : 0;
    });

    renderer.render(scene, camera);
    stats.update();
  }

  animate();
}

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
