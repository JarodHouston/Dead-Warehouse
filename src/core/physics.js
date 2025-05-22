import * as THREE from 'three';
import {
  WALK_SPEED, JUMP_SPEED, GRAVITY
} from './constants.js';

const tmpVec  = new THREE.Vector3();
const side    = new THREE.Vector3();

export function handleInput(dt, keys, velocity, camera, onFloor) {
  /* 1  Build horizontal vector */
  const horiz = new THREE.Vector3(
    Number(keys.d) - Number(keys.a),
    0,
    Number(keys.s) - Number(keys.w)
  );

  if (horiz.lengthSq() > 0) {
    camera.getWorldDirection(tmpVec); // forward
    tmpVec.y = 0; tmpVec.normalize();
    side.crossVectors(tmpVec, camera.up).normalize();

    const moveDir = tmpVec.multiplyScalar(-horiz.z)
                    .add(side.clone().multiplyScalar(horiz.x));

    velocity.x = moveDir.x * WALK_SPEED;
    velocity.z = moveDir.z * WALK_SPEED;
  } else {
    velocity.x = velocity.z = 0;
  }

  if (onFloor && keys[' ']) velocity.y = JUMP_SPEED;
}

export function playerPhysics(
  playerCollider, velocity, worldOctree, spawnPos, dt
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
    velocity.set(0,0,0);
    onFloor = true;
  }

  return onFloor;
}
