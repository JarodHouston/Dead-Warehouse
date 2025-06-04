import * as THREE from "three";

export function handleShot(camera, raycaster, zombieGroup) {
  const dir = new THREE.Vector3().copy(
    camera.getWorldDirection(new THREE.Vector3())
  );
  raycaster.set(camera.position, dir);

  // Check intersections with all zombies in the scene
  const intersects = raycaster.intersectObjects(
    zombieGroup.zombies.map((z) => z.model),
    true
  );

  console.log(intersects);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    console.log("Hit zombie:", hit.name || hit);

    if (hit.name === "head") {
      console.log("HEADSHOT BABYYYY");
    }

    // Optional: Mark it, reduce health, remove it, etc.
    hit.material.color.set("red"); // for example
  }
}
