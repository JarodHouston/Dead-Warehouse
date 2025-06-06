import { score, kills } from "../gun/shoot";

// playerDeath.js
export function createDeathSystem({
  camera,
  spawn,
  playerCollider,
  PLAYER_RADIUS,
  PLAYER_HEIGHT,
  controls,
  walkSound,
  sprintSound,
  shoot,
}) {
  let isPlayerDead = false;

  function killPlayer() {
    if (isPlayerDead) return;
    isPlayerDead = true;

    controls.unlock();
    controls.disconnect();
    controls.velocity?.set(0, 0, 0);
    //canvas.removeEventListener('click', requestLock);

    walkSound.stop();
    sprintSound.stop();

    document.getElementById("death-screen").style.display = "block";
    document.getElementById("end-score").textContent = `Score: ${score}`;
    document.getElementById("end-kills").textContent = `Kills: ${kills}`;
    document.getElementById("crosshaird").style.display = "none";
    // deathScreen.style.display = 'flex';
    zombieGroup.setActive(false);
  }

  function respawnPlayer() {
    if (!isPlayerDead) return;
    isPlayerDead = false;

    camera.position.copy(spawn);
    playerCollider.start.set(spawn.x, PLAYER_RADIUS, spawn.z);
    playerCollider.end.set(spawn.x, PLAYER_HEIGHT, spawn.z);

    controls.connect();
    controls.lock();
    //canvas.addEventListener('click', requestLock);
    controls.velocity?.set(0, 0, 0);

    deathScreen.style.display = "none";
    zombieGroup.setActive(true);
  }

  return { killPlayer, respawnPlayer, isDead: () => isPlayerDead };
}
