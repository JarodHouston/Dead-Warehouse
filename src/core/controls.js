import * as THREE from 'three';
import { OrbitControls }      from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls }from 'three/examples/jsm/controls/PointerLockControls.js';
import { DEV_MODE }           from './constants.js';

export function createControls(camera, rendererDom) {
  if (DEV_MODE) {
    const controls = new OrbitControls(camera, rendererDom);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.05;
    return controls;
  }

  const controls = new PointerLockControls(camera, document.body);
  window.addEventListener('click', () => controls.lock());
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement) controls.unlock();
  });
  return controls;
}
