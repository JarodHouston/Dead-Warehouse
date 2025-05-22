import * as THREE from 'three';
import { Capsule }    from 'three/examples/jsm/math/Capsule.js';
import {
  PLAYER_RADIUS,
  PLAYER_HEIGHT
} from '../core/constants.js';

export function createPlayerCollider(spawn) {
  return new Capsule(
    new THREE.Vector3(spawn.x, PLAYER_RADIUS, spawn.z),
    new THREE.Vector3(spawn.x, PLAYER_HEIGHT, spawn.z),
    PLAYER_RADIUS
  );
}
