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

  /* --- UI overlay ------------------------------------------------------- */
  const deathScreen          = document.createElement('div');
  deathScreen.style.cssText  = `
      position:fixed;inset:0;display:none;align-items:center;justify-content:center;
      font:900 3rem/1 sans-serif;color:#fff;background:rgb(0, 0, 0);z-index:9999;
      text-align:center;user-select:none`;
  deathScreen.textContent    = 'You died\nLeft-click to respawn';
  document.body.appendChild(deathScreen);


  function killPlayer() {
    if (isPlayerDead) return;
    isPlayerDead = true;

    controls.unlock();
    controls.disconnect();
    controls.velocity?.set(0, 0, 0);
    //canvas.removeEventListener('click', requestLock);

    walkSound.stop();
    sprintSound.stop();

    deathScreen.style.display = 'flex';
    zombieGroup.setActive(false);
  }

  function respawnPlayer() {
    if (!isPlayerDead) return;
    isPlayerDead = false;

    camera.position.copy(spawn);
    playerCollider.start.set(spawn.x, PLAYER_RADIUS, spawn.z);
    playerCollider.end  .set(spawn.x, PLAYER_HEIGHT, spawn.z);

    controls.connect();
    controls.lock();
    //canvas.addEventListener('click', requestLock);
    controls.velocity?.set(0, 0, 0);

    deathScreen.style.display = 'none';
    zombieGroup.setActive(true);
  }

  return { killPlayer, respawnPlayer, isDead: () => isPlayerDead };
}