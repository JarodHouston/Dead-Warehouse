import * as THREE from "three";

export function handleShot() {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  raycaster.set(camera.position, cameraDirection);

  // Check intersections with all zombies in the scene
  const intersects = raycaster.intersectObjects(zombieGroup.zombies, true); // .zombies is your array
  console.log(intersects);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    console.log("Hit zombie:", hit.name || hit);

    // Optional: Mark it, reduce health, remove it, etc.
    hit.material.color.set("red"); // for example
  }
}
