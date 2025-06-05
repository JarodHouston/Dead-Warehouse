// muzzleFlash.js
import * as THREE from "three";

export function addMuzzleFlash(gun) {
  const anchor = new THREE.Object3D();
  anchor.name = "muzzleFlashAnchor";
  anchor.position.set(-4.0, 1.0, 0);
  /* X+ -> backward, X- -> forward, Y+ -> up, Y- -> down, Z+ -> left, Z- -> right */ 
  gun.add(anchor);

  const light = new THREE.PointLight(0xffa955, 5, 3, 2); // color, intensity, distance, decay
  light.visible = false;
  anchor.add(light);

  // muzzle flash png sprite
  const tex = new THREE.TextureLoader().load("../../textures/muzzleFlash.png");
  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.6, 0.6, 0.6);
  sprite.visible = false;
  anchor.add(sprite);

  return { light, sprite, timer: 0 };
}

export function triggerFlash(flash) {
  flash.timer = 0.05;
  flash.light.visible = flash.sprite.visible = true;
  flash.light.intensity = 10;
  flash.sprite.scale.set(1.0, 1.0, 1.0);
}

export function updateFlash(flash, delta) {
  if (flash.timer <= 0) return;
  flash.timer -= delta;

  // Simple exponential fade
  flash.light.intensity *= 0.6;
  flash.sprite.scale.multiplyScalar(1.5);

  if (flash.timer <= 0) {
    flash.light.visible = flash.sprite.visible = false;
  }
}