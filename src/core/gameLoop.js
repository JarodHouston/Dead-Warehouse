import * as THREE     from 'three';
import Stats          from 'three/examples/jsm/libs/stats.module.js';
import { SUBSTEPS }   from './constants.js';
import { getKeys }    from './input.js';
import { handleInput, playerPhysics } from './physics.js';
import { updateRecoil } from '../gun/gun.js';

export function startGameLoop({
  camera, controls, renderer, scene,
  worldOctree, playerCollider, spawnPos,
  updateZombie, updateRecoil
}) {
  const clock   = new THREE.Clock();
  const stats   = new Stats();
  document.body.appendChild(stats.dom);

  const velocity = new THREE.Vector3();
  let onFloor    = false;

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const step = Math.min(0.05, dt) / SUBSTEPS;

    for (let i = 0; i < SUBSTEPS; i++) {
      handleInput(step, getKeys(), velocity, camera, onFloor);
      onFloor = playerPhysics(
        playerCollider, velocity, worldOctree, spawnPos, step
      );
    }
    controls.getObject().position.copy(playerCollider.end);

    updateRecoil();
    updateZombie(clock.getElapsedTime());   // your AI tick
    renderer.render(scene, camera);
    stats.update();
  }

  animate();
}
