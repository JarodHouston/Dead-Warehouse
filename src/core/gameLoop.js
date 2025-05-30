import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { SUBSTEPS } from "./constants.js";
import { getKeys } from "./input.js";
import { handleInput, playerPhysics } from "./physics.js";
import { pointLights } from "../warehouse/warehouse.js";
import { updateRecoil } from "../gun/gun.js";

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
      handleInput(step, getKeys(), velocity, camera, onFloor);
      onFloor = playerPhysics(
        playerCollider,
        velocity,
        worldOctree,
        spawnPos,
        step
      );
    }
    controls.getObject().position.copy(playerCollider.end);

    updateRecoil();
    updateZombie(clock.getElapsedTime()); // your AI tick

    // Show point lights that are close to player
    pointLights.forEach(({ light, bulb }) => {
      const distance = light.position.distanceTo(camera.position);
      const active = distance <= 25;

      light.visible = active;
      bulb.visible = active;

      // bulb.material.emissiveIntensity = active ? 1 : 0;
    });

    console.log(camera.position);

    renderer.render(scene, camera);
    stats.update();
  }

  animate();
}
