import * as THREE from "three";
import { WALK_SPEED, SPRINT_SPEED, JUMP_SPEED, GRAVITY } from "./constants.js";
import { isSprinting } from "./gameLoop.js";

const tmpVec = new THREE.Vector3();
const side = new THREE.Vector3();

let lastStepTime = 0;
const activeFootstepSounds = []; // Store currently playing footstep sounds

export function handleInput(
  dt,
  keys,
  velocity,
  camera,
  onFloor,
  walkSound,
  sprintSound
) {
  const horiz = new THREE.Vector3(
    Number(keys.d) - Number(keys.a),
    0,
    Number(keys.s) - Number(keys.w)
  );

  const isMoving = horiz.lengthSq() > 0;

  if (isMoving) {
    camera.getWorldDirection(tmpVec);
    tmpVec.y = 0;
    tmpVec.normalize();
    side.crossVectors(tmpVec, camera.up).normalize();

    const moveDir = tmpVec
      .multiplyScalar(-horiz.z)
      .add(side.clone().multiplyScalar(horiz.x));

    velocity.x = moveDir.x * (isSprinting ? SPRINT_SPEED : WALK_SPEED);
    velocity.z = moveDir.z * (isSprinting ? SPRINT_SPEED : WALK_SPEED);

    if (onFloor) {
      const now = performance.now();
      const stepInterval = isSprinting ? 600 : 900;

      if (now - lastStepTime > stepInterval) {
        // Stop all current footstep sounds
        activeFootstepSounds.forEach((snd) => {
          if (snd.isPlaying) snd.stop();
        });
        activeFootstepSounds.length = 0; // Clear the array

        // Clone and play new sound
        const newSound = (isSprinting ? sprintSound : walkSound).clone();
        newSound.play();
        activeFootstepSounds.push(newSound);

        lastStepTime = now;
      }
    }
  } else {
    velocity.x = velocity.z = 0;
  }

  if (onFloor && keys[" "]) velocity.y = JUMP_SPEED;
}

export function playerPhysics(
  playerCollider,
  velocity,
  worldOctree,
  spawnPos,
  dt
) {
  let onFloor = false;

  /* gravity */
  if (!onFloor) velocity.y -= GRAVITY * dt;

  /* move */
  playerCollider.translate(velocity.clone().multiplyScalar(dt));

  /* collide */
  const result = worldOctree.capsuleIntersect(playerCollider);
  if (result) {
    onFloor = result.normal.y > 0.5;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
    velocity.addScaledVector(result.normal, -result.normal.dot(velocity));
  }

  /* respawn */
  if (playerCollider.end.y < -10) {
    playerCollider.start.set(spawnPos.x, playerCollider.radius, spawnPos.z);
    playerCollider.end.set(spawnPos.x, playerCollider.height, spawnPos.z);
    velocity.set(0, 0, 0);
    onFloor = true;
  }

  return onFloor;
}
