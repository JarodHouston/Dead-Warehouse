import * as THREE from "three";

let score = 0;
let kills = 0;

export function handleShot(camera, raycaster, zombieGroup) {
  const dir = new THREE.Vector3().copy(
    camera.getWorldDirection(new THREE.Vector3())
  );
  raycaster.set(camera.position, dir);

  // ONLY CHECKS ZOMBIE OBJECTS (should do raycast considering ALL environment objects)
  const intersects = raycaster.intersectObjects(
    zombieGroup.zombies.map((z) => z.model),
    true
  );

  console.log(intersects);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const part = hit.userData.part;
    const zombie = hit.userData.zombie;

    console.log("Hit zombie:", hit.name || hit);

    let currHealth = null;

    if (hit.name === "head") {
      console.log("HEADSHOT BABYYYY");
      currHealth = zombie.removeHealth(100);
      score += 100;
    } else if (hit.name === "torso") {
      console.log("ok body shot!");
      currHealth = zombie.removeHealth(50);
      score += 35;
    } else {
      currHealth = zombie.removeHealth(25);
      score += 10;
    }

    if (currHealth <= 0) {
      score += 50;
      kills += 1;
    }

    updateScoreUI();
    updateKillsUI();

    console.log("Zombie health: ", currHealth);

    // Optional: Mark it, reduce health, remove it, etc.
    hit.material.color.set("red"); // for example
  }
}

function updateScoreUI() {
  const scoreElement = document.getElementById("score");
  if (scoreElement) scoreElement.textContent = `Score: ${score}`;
}

function updateKillsUI() {
  const killsElement = document.getElementById("kills");
  if (killsElement) killsElement.textContent = `Kills: ${kills}`;
}
